export const categoryConfig = {
  'Prevenção': {
    icon: 'shield',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-200'
  },
  'Tratamento': {
    icon: 'stethoscope',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-200'
  },
  'Olho Seco': {
    icon: 'droplets',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    hoverBg: 'hover:bg-blue-200'
  },
  'Tecnologia': {
    icon: 'cpu',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-200'
  },
  'Dúvidas Frequentes': {
    icon: 'help-circle',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-200'
  }
}

export const categories = ['Todas', ...Object.keys(categoryConfig)]

export default {
  categoryConfig,
  categories
}
