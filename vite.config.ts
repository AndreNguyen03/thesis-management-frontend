import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './src/components'),
      '@/components/ui': path.resolve(__dirname, './src/components/ui'),
      '@/components/layout': path.resolve(__dirname, './src/components/layout'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/features/admin': path.resolve(__dirname, './src/features/admin'),
      '@/features/shared': path.resolve(__dirname, './src/features/shared'),
      '@/features/shared/ai-assistant': path.resolve(__dirname, './src/features/shared/ai-assistant'),
      '@/features/shared/dashboard': path.resolve(__dirname, './src/features/shared/dashboard'),
      '@/features/shared/workspace': path.resolve(__dirname, './src/features/shared/workspace'),
      '@/features/student': path.resolve(__dirname, './src/features/student'),
      '@/features/student/topic_list': path.resolve(__dirname, './src/features/student/topic_list'),
      '@/features/teacher': path.resolve(__dirname, './src/features/teacher'),
      '@/features/teacher/manage_topic': path.resolve(__dirname, './src/features/teacher/manage_topic'),
      '@/features/teacher/new_topic': path.resolve(__dirname, './src/features/teacher/new_topic'),
      '@/features/teacher/plagiarism_check': path.resolve(__dirname, './src/features/teacher/plagiarism_check'),
      '@/features/teacher/topic_registration': path.resolve(__dirname, './src/features/teacher/topic_registration'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
})
