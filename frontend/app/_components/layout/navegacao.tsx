import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/app/_components/ui/avatar'
import Button from '@/app/_components/ui/button'
import Link from 'next/link'
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  Sparkles,
  Hash
} from 'lucide-react'

const NavItem = ({
  href,
  Icon,
  label
}: {
  href: string
  Icon: any
  label: string
}) => (
  <li>
    <Link
      href={href}
      className='hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl px-3 py-2 transition-colors'
    >
      <Icon className='h-6 w-6' />
      <span className='hidden text-sm font-semibold md:inline'>{label}</span>
    </Link>
  </li>
)

export default function Navegacao() {
  return (
    <aside className='fixed mt-6 mr-6 flex h-screen w-64 min-w-56 flex-col justify-between'>
      <div>
        <div className='mb-4 flex items-center gap-3 px-2'>
          <img src='/logo.svg' alt='Visura' className='h-8 w-8' />
          <h1 className='text-lg font-bold'>Visura</h1>
        </div>

        {/* quick search */}
        <div className='mb-4 px-2'>
          <label className='relative block'>
            <span className='sr-only'>Pesquisar</span>
            <input
              placeholder='Pesquisar pessoas, tópicos...'
              className='bg-background focus:ring-primary w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2'
            />
            <Search className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 opacity-60' />
          </label>
        </div>

        <nav aria-label='Main navigation' className='px-2'>
          <ul className='flex flex-col gap-1'>
            <NavItem href='/home' Icon={Home} label='Página inicial' />
            <NavItem href='/explorar' Icon={Sparkles} label='Explorar' />
            <NavItem href='/notifications' Icon={Bell} label='Notificações' />
            <NavItem href='/messages' Icon={Mail} label='Mensagens' />
            <NavItem href='/saved' Icon={Bookmark} label='Salvos' />
            <NavItem href='/posts/trending' Icon={Hash} label='Tópicos' />
          </ul>
        </nav>

        <div className='mt-4 px-2'>
          <Button className='w-full' size='lg'>
            Publicar
          </Button>
        </div>
      </div>

      <div className='mb-18 px-2'>
        <div className='hover:bg-accent flex items-center gap-3 rounded-full p-2 transition-colors'>
          <Avatar>
            <AvatarImage src='/avatar1.png' alt='User Avatar' />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <p className='truncate font-semibold'>
                Jean Antonio Rodrigues dos Santos
              </p>
              <span className='text-muted-foreground text-xs'>@saittu</span>
            </div>
            <div className='mt-1 flex gap-2'>
              <Link
                href='/profile'
                className='text-muted-foreground hover:text-foreground text-xs'
              >
                Ver perfil
              </Link>
              <button className='text-muted-foreground hover:text-foreground text-xs'>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
