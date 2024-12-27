import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Upload, User, BarChart3, GitGraph } from 'lucide-react'
import { useState, ChangeEvent } from 'react'
import { read, utils, WorkBook } from 'xlsx'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EntityGraph } from './components/EntityGraph'

interface ExcelRow {
  [key: string]: string | number
}

interface ChartData {
  name: string
  [key: string]: string | number
}

function App() {
  const [data, setData] = useState<ChartData[]>([])
  const [numericalColumns, setNumericalColumns] = useState<string[]>([])
  const [selectedColorSet, setSelectedColorSet] = useState<number>(0)
  const [chartType, setChartType] = useState<'line' | 'entity'>('line')

  const colorSets = [
    ['#1e3a8a', '#2563eb', '#3b82f6', '#0d9488', '#67e8f9'], // Blues and Teals
    ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#c7d2fe'], // Blues to Purple
    ['#fef3c7', '#e0f2fe', '#bfdbfe', '#ddd6fe', '#fce7f3'], // Warm Neutrals
    ['#f87171', '#fcd34d', '#fef08a', '#86efac', '#67e8f9'], // Warm to Cool
    ['#7c3aed', '#f87171', '#facc15', '#10b981', '#f97316']  // Vibrant Mix
  ];

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx')) {
      alert('Please upload an Excel (.xlsx) file')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as string
        console.log('File read successfully')

        const workbook = read(data, { type: 'binary' }) as WorkBook
        console.log('Workbook loaded:', workbook.SheetNames)

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = utils.sheet_to_json<ExcelRow>(firstSheet)
        console.log('First row data:', jsonData[0])

        if (!jsonData || jsonData.length === 0) {
          console.error('No data found in Excel file')
          return
        }

        const firstRow = jsonData[0]
        const columns = Object.keys(firstRow)
        console.log('Detected columns:', columns)

        const detectedNumericalColumns = columns.filter(col => {
          const value = firstRow[col]
          const isNumeric = typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))
          console.log(`Column ${col}: value=${value}, type=${typeof value}, isNumeric=${isNumeric}`)
          return isNumeric
        })

        console.log('Detected numerical columns:', detectedNumericalColumns)

        if (chartType === 'line') {
          if (detectedNumericalColumns.length === 0) {
            console.error('No numerical columns found for line chart')
            return
          }

          const firstColumn = columns[0]
          console.log('Using first column as X-axis:', firstColumn)

          const chartData = jsonData.map((row: ExcelRow) => {
            const transformedRow: ChartData = {
              name: String(row[firstColumn]),
            }
            detectedNumericalColumns.forEach(col => {
              const value = row[col]
              transformedRow[col] = typeof value === 'number' ? value : Number(value)
              console.log(`Row data: ${col}=${value} -> ${transformedRow[col]}`)
            })
            return transformedRow
          })

          console.log('Final chart data:', chartData)
          setData(chartData)
          setNumericalColumns(detectedNumericalColumns)
        } else {
          // Entity graph processing
          const nonNumericalColumns = columns.filter(col => {
            const value = firstRow[col]
            const isNumeric = typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))
            return !isNumeric
          })

          console.log('Non-numerical columns for entity graph:', nonNumericalColumns)

          const chartData = jsonData.map((row: ExcelRow) => {
            const transformedRow: ChartData = {
              name: String(row[columns[0]]),
            }
            nonNumericalColumns.forEach(col => {
              const value = row[col]
              transformedRow[col] = String(value)
            })
            return transformedRow
          })

          console.log('Final entity graph data:', chartData)
          setData(chartData)
          setNumericalColumns([])
        }
      } catch (error) {
        console.error('Error processing Excel file:', error)
      }
    }

    reader.readAsBinaryString(file)
  }

  const handleUploadClick = () => {
    const input = document.getElementById('excel-upload') as HTMLInputElement
    input?.click()
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">Logo</h1>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink className="px-4 py-2">Workspace</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <User className="h-6 w-6" />
        </div>
      </nav>

      <main className="container mx-auto grid grid-cols-12 gap-6 p-6">
        <div className="col-span-8">
          <Card className="p-6">
            <div className="flex gap-2 mb-4">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                onClick={() => setChartType('line')}
                className="flex items-center"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Line Chart
              </Button>
              <Button
                variant={chartType === 'entity' ? 'default' : 'outline'}
                onClick={() => setChartType('entity')}
                className="flex items-center"
              >
                <GitGraph className="mr-2 h-4 w-4" />
                Entity Graph
              </Button>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  data.length > 0 ? (
                    numericalColumns.length > 0 ? (
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip />
                        <Legend />
                        {numericalColumns.map((key, index) => {
                          const colorIndex = index % 5; // Use modulo to cycle through colors
                          return (
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              name={key}
                              stroke={colorSets[selectedColorSet][colorIndex]}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          );
                        })}
                      </LineChart>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No numerical data available for line chart</p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Upload an Excel file to generate line chart</p>
                    </div>
                  )
                ) : (
                  // Entity graph rendering
                  data.length > 0 ? (
                    Object.keys(data[0]).some(key => {
                      const value = data[0][key]
                      return !(typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value))))
                    }) ? (
                      <EntityGraph
                        data={data}
                        selectedColors={colorSets[selectedColorSet]}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No non-numerical data available for entity graph</p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Upload an Excel file to generate entity graph</p>
                    </div>
                  )
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="col-span-4">
          <Card className="flex flex-col items-center justify-center p-6 text-center">
            <Upload className="h-12 w-12 text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Upload Excel</h2>
            <p className="text-gray-500 mb-4">Upload your excel. Your excel will generate charts</p>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="excel-upload"
            />
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleUploadClick}
            >
              Upload Excel
            </Button>
          </Card>

          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold mb-4">Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Color Palettes</h4>
                <div className="space-y-2">
                  {[
                    ['bg-blue-900', 'bg-blue-600', 'bg-blue-500', 'bg-teal-600', 'bg-cyan-300'], // Blues and Teals
                    ['bg-blue-900', 'bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-indigo-200'], // Blues to Purple
                    ['bg-amber-50', 'bg-blue-50', 'bg-blue-100', 'bg-purple-100', 'bg-pink-100'], // Warm Neutrals
                    ['bg-red-400', 'bg-orange-300', 'bg-yellow-200', 'bg-green-300', 'bg-cyan-300'], // Warm to Cool
                    ['bg-violet-600', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-500', 'bg-orange-500'] // Vibrant Mix
                  ].map((palette, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-5 gap-2 cursor-pointer p-1 transition-all duration-200 ${
                        selectedColorSet === i ? 'ring-2 ring-blue-500 rounded' : ''
                      }`}
                      onClick={() => setSelectedColorSet(i)}
                      role="button"
                      aria-label={`Color palette ${i + 1}`}
                    >
                      {palette.map((color, j) => (
                        <div key={j} className={`${color} h-8 rounded`}></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 text-center">
                <div>
                  <div className="font-semibold">0</div>
                  <div className="text-sm text-gray-500">Frame</div>
                </div>
                <div>
                  <div className="font-semibold">0</div>
                  <div className="text-sm text-gray-500">Frame</div>
                </div>
                <div>
                  <div className="font-semibold">0</div>
                  <div className="text-sm text-gray-500">Frame</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600">Greater Seattle, WA, USA</p>
              <p className="font-semibold">Freeleaps</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Links</h4>
              <div className="space-y-2">
                <p className="text-gray-600">About</p>
                <p className="text-gray-600">Blogs</p>
                <p className="text-gray-600">Career</p>
                <p className="text-gray-600">Contact</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Language</h4>
              <p className="text-gray-600">English</p>
            </div>
            <div>
              <p className="text-gray-600">© 2023 All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
