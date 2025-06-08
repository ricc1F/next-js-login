// /pages/api/user/me.js
import jwt from "jsonwebtoken";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json(decoded); // Retorna os dados do usuário contidos no token
  } catch (error) {
    res.status(403).json({ message: "Token inválido" });
  }
}
