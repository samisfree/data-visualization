import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Upload, User } from 'lucide-react'
import { useState, ChangeEvent } from 'react'
import { read, utils } from 'xlsx'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ExcelRow {
  [key: string]: string | number | Date
}

interface ChartData {
  name: string
  [key: string]: string | number
}

function App() {
  const [data, setData] = useState<ChartData[]>([])

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx')) {
      alert('Please upload an Excel (.xlsx) file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const result = e.target?.result
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid file content')
        }

        const workbook = read(result, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = utils.sheet_to_json<ExcelRow>(firstSheet)

        if (!jsonData || jsonData.length === 0) {
          alert('Excel file is empty')
          return
        }

        // Get column names and identify numerical columns
        const columns = Object.keys(jsonData[0])
        const firstColumn = columns[0]
        const numericalColumns = columns.filter(col =>
          typeof jsonData[0][col] === 'number'
        )

        if (numericalColumns.length === 0) {
          alert('No numerical columns found in Excel file')
          return
        }

        // Transform data for chart
        const chartData = jsonData.map(row => ({
          name: String(row[firstColumn]),
          ...numericalColumns.reduce((acc, col) => ({
            ...acc,
            [col]: Number(row[col])
          }), {})
        }))

        setData(chartData)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        alert('Error parsing Excel file: ' + message)
      }
    }
    reader.readAsArrayBuffer(file)
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
                <NavigationMenuItem>
                  <NavigationMenuLink className="px-4 py-2">Jobs</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className="px-4 py-2">Workers</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className="px-4 py-2">Post a Job</NavigationMenuLink>
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
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {Object.keys(data[0] || {})
                    .filter(key => key !== 'name')
                    .map((key, index) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={key}
                        stroke={['#3B82F6', '#22C55E', '#F97316', '#A855F7'][index]}
                      />
                    ))}
                </LineChart>
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
                <h4 className="font-medium mb-2">Color Palette</h4>
                <div className="grid grid-cols-4 gap-2">
                  {['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'].map((color, i) => (
                    <div key={i} className={`${color} h-8 rounded`}></div>
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
