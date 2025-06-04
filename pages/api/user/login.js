import { login } from '../../../controllers/userController.js'

export default function handler(req, res) {
  if (req.method === 'POST') {
    return login(req, res)
  }
  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
