/**
 * 🎯 SHIM motion.react.ts - Redirige vers notre implémentation locale
 * 
 * Ce fichier permet d'utiliser import { motion } from 'motion/react'
 * sans CDN externe en redirigeant vers notre implémentation
 */

export * from './lib/motion';
export { motion, AnimatePresence } from './lib/motion';
