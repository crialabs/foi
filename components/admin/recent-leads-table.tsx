import { formatDistanceToNow } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Lead {
  id: number
  email: string
  whatsapp: string
  age: string
  created_at: string
}

interface RecentLeadsTableProps {
  leads: Lead[]
}

export default function RecentLeadsTable({ leads }: RecentLeadsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>WhatsApp</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.length > 0 ? (
          leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.email}</TableCell>
              <TableCell>{lead.whatsapp}</TableCell>
              <TableCell>{lead.age}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No leads found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
