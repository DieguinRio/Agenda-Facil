import { DB, saveSvcs, saveClients, saveAppts } from './lib/db.js'
import { todayStr } from './lib/helpers.js'

export function seedDemo() {
  if (localStorage.getItem('af_seeded')) return

  const svcs = [
    { id:'svc1', name:'Corte de Cabelo',       description:'Corte masculino ou feminino', duration_minutes:45,  price:55,  active:true, created_date:'2026-01-01' },
    { id:'svc2', name:'Manicure',              description:'Unhas das mãos',             duration_minutes:60,  price:45,  active:true, created_date:'2026-01-01' },
    { id:'svc3', name:'Design de Sobrancelha', description:'Modelagem e design',         duration_minutes:30,  price:35,  active:true, created_date:'2026-01-01' },
    { id:'svc4', name:'Coloração',             description:'Tintura e técnicas',         duration_minutes:120, price:150, active:true, created_date:'2026-01-01' },
    { id:'svc5', name:'Escova',                description:'Escova progressiva',         duration_minutes:60,  price:70,  active:true, created_date:'2026-01-01' },
  ]
  const clients = [
    { id:'cli1', name:'Ana Paula Souza',  phone:'(11) 98765-4321', email:'ana@email.com',      notes:'Prefere manhã',         created_date:'2026-01-05' },
    { id:'cli2', name:'Carlos Eduardo',   phone:'(11) 91234-5678', email:'',                   notes:'',                     created_date:'2026-01-10' },
    { id:'cli3', name:'Fernanda Lima',    phone:'(11) 97654-3210', email:'fernanda@email.com', notes:'Alérgica a produtos',   created_date:'2026-01-12' },
    { id:'cli4', name:'Roberto Alves',    phone:'(11) 99876-5432', email:'',                   notes:'',                     created_date:'2026-02-01' },
    { id:'cli5', name:'Juliana Martins',  phone:'(11) 93456-7890', email:'ju@email.com',        notes:'Cliente VIP',          created_date:'2026-02-14' },
  ]

  const today = todayStr()
  const [y, m, d] = today.split('-').map(Number)
  const ds = (offset) => {
    const dt = new Date(y, m-1, d+offset)
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
  }

  const appts = [
    { id:DB.id(), client_id:'cli1', client_name:'Ana Paula Souza',  client_phone:'(11) 98765-4321', service_id:'svc1', service_name:'Corte de Cabelo',       date:ds(0),  time:'09:00', price:55,  notes:'',                  status:'scheduled', created_date:today },
    { id:DB.id(), client_id:'cli3', client_name:'Fernanda Lima',    client_phone:'(11) 97654-3210', service_id:'svc3', service_name:'Design de Sobrancelha', date:ds(0),  time:'10:30', price:35,  notes:'',                  status:'scheduled', created_date:today },
    { id:DB.id(), client_id:'cli5', client_name:'Juliana Martins',  client_phone:'(11) 93456-7890', service_id:'svc4', service_name:'Coloração',             date:ds(0),  time:'14:00', price:150, notes:'Mechas californianas', status:'scheduled', created_date:today },
    { id:DB.id(), client_id:'cli2', client_name:'Carlos Eduardo',   client_phone:'(11) 91234-5678', service_id:'svc1', service_name:'Corte de Cabelo',       date:ds(1),  time:'11:00', price:55,  notes:'',                  status:'scheduled', created_date:today },
    { id:DB.id(), client_id:'cli4', client_name:'Roberto Alves',    client_phone:'(11) 99876-5432', service_id:'svc2', service_name:'Manicure',              date:ds(2),  time:'15:30', price:45,  notes:'',                  status:'scheduled', created_date:today },
    { id:DB.id(), client_id:'cli1', client_name:'Ana Paula Souza',  client_phone:'(11) 98765-4321', service_id:'svc5', service_name:'Escova',                date:ds(-1), time:'10:00', price:70,  notes:'',                  status:'completed', created_date:today },
    { id:DB.id(), client_id:'cli3', client_name:'Fernanda Lima',    client_phone:'(11) 97654-3210', service_id:'svc2', service_name:'Manicure',              date:ds(-3), time:'09:30', price:45,  notes:'',                  status:'completed', created_date:today },
    { id:DB.id(), client_id:'cli5', client_name:'Juliana Martins',  client_phone:'(11) 93456-7890', service_id:'svc1', service_name:'Corte de Cabelo',       date:ds(-5), time:'14:00', price:55,  notes:'',                  status:'completed', created_date:today },
    { id:DB.id(), client_id:'cli2', client_name:'Carlos Eduardo',   client_phone:'(11) 91234-5678', service_id:'svc3', service_name:'Design de Sobrancelha', date:ds(-2), time:'16:00', price:35,  notes:'',                  status:'cancelled', created_date:today },
  ]

  saveSvcs(svcs); saveClients(clients); saveAppts(appts)
  localStorage.setItem('af_seeded', '1')
}
