import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@/app/components/ui/button/page'

const meta: Meta<typeof Button> = {
  title: 'Example/Button',
  component: Button
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Botão Primário'
  }
}
