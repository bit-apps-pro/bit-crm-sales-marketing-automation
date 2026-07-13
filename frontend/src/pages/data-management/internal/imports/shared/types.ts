export interface ImportsData {
  create_count: number
  created_at: string
  file_name: string
  file_path: string
  id: number
  module: string
  process_id: string
  skip_count: number
  status: 'completed' | 'processing'
  total_count: number
  update_count: number
  updated_at: string
}

export interface ImportsTableProps {
  importsData: ImportsData[]
  loading: boolean
}

export interface ImportsDataResponse {
  data: ImportsData[]
  total: number
}

export interface ImportsDataParams {
  module: string
  page: number
  perPage: number
}
