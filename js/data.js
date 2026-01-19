/**
 * Repository file structure data
 * This can be generated dynamically or updated manually
 */
const fileStructure = {
    name: 'claude-tool-use',
    type: 'folder',
    children: [
        {
            name: 'src',
            type: 'folder',
            children: [
                {
                    name: 'components',
                    type: 'folder',
                    children: [
                        { name: 'SuspenseLoader.tsx', type: 'file', size: 1240, ext: 'tsx', preview: 'import React, { Suspense } from "react";\nimport { Box, CircularProgress } from "@mui/material";\n\nexport const SuspenseLoader: React.FC<Props> = ({ children }) => {\n  return <Suspense fallback={<Loading />}>{children}</Suspense>;\n};' },
                        { name: 'CustomAppBar.tsx', type: 'file', size: 2100, ext: 'tsx', preview: 'import { AppBar, Toolbar, Typography } from "@mui/material";\n\nexport const CustomAppBar: React.FC = () => {\n  return <AppBar position="sticky">...</AppBar>;\n};' }
                    ]
                },
                {
                    name: 'features',
                    type: 'folder',
                    children: [
                        {
                            name: 'auth',
                            type: 'folder',
                            children: [
                                { name: 'api', type: 'folder', children: [
                                    { name: 'authApi.ts', type: 'file', size: 890, ext: 'ts', preview: 'import { apiClient } from "@/lib/apiClient";\n\nexport const authApi = {\n  login: (data) => apiClient.post("/auth/login", data),\n  logout: () => apiClient.post("/auth/logout"),\n};' }
                                ]},
                                { name: 'components', type: 'folder', children: [
                                    { name: 'LoginForm.tsx', type: 'file', size: 3200, ext: 'tsx', preview: 'import { useForm } from "react-hook-form";\nimport { zodResolver } from "@hookform/resolvers/zod";\n\nexport const LoginForm: React.FC = () => {\n  const { register, handleSubmit } = useForm();\n  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;\n};' }
                                ]},
                                { name: 'hooks', type: 'folder', children: [
                                    { name: 'useAuth.ts', type: 'file', size: 1500, ext: 'ts', preview: 'import { useContext } from "react";\nimport { AuthContext } from "../context";\n\nexport const useAuth = () => {\n  const context = useContext(AuthContext);\n  if (!context) throw new Error("useAuth must be within AuthProvider");\n  return context;\n};' }
                                ]},
                                { name: 'types', type: 'folder', children: [
                                    { name: 'index.ts', type: 'file', size: 450, ext: 'ts', preview: 'export interface User {\n  id: number;\n  email: string;\n  name: string;\n  role: "admin" | "user";\n}\n\nexport interface AuthState {\n  user: User | null;\n  isAuthenticated: boolean;\n}' }
                                ]},
                                { name: 'index.ts', type: 'file', size: 280, ext: 'ts', preview: 'export { authApi } from "./api/authApi";\nexport { LoginForm } from "./components/LoginForm";\nexport { useAuth } from "./hooks/useAuth";\nexport type { User, AuthState } from "./types";' }
                            ]
                        },
                        {
                            name: 'posts',
                            type: 'folder',
                            children: [
                                { name: 'api', type: 'folder', children: [
                                    { name: 'postsApi.ts', type: 'file', size: 1200, ext: 'ts', preview: 'import { apiClient } from "@/lib/apiClient";\nimport type { Post } from "~types/post";\n\nexport const postsApi = {\n  getAll: () => apiClient.get<Post[]>("/posts"),\n  getById: (id: number) => apiClient.get<Post>("/posts/" + id),\n  create: (data: Partial<Post>) => apiClient.post("/posts", data),\n};' }
                                ]},
                                { name: 'components', type: 'folder', children: [
                                    { name: 'PostList.tsx', type: 'file', size: 2800, ext: 'tsx', preview: 'import { useSuspenseQuery } from "@tanstack/react-query";\nimport { postsApi } from "../api/postsApi";\n\nexport const PostList: React.FC = () => {\n  const { data: posts } = useSuspenseQuery({\n    queryKey: ["posts"],\n    queryFn: postsApi.getAll,\n  });\n  return <Grid container>{posts.map(...)}</Grid>;\n};' },
                                    { name: 'PostCard.tsx', type: 'file', size: 1600, ext: 'tsx', preview: 'import { Card, CardContent, Typography } from "@mui/material";\nimport type { Post } from "~types/post";\n\ninterface PostCardProps {\n  post: Post;\n  onClick?: () => void;\n}\n\nexport const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {\n  return <Card onClick={onClick}>...</Card>;\n};' }
                                ]},
                                { name: 'index.ts', type: 'file', size: 180, ext: 'ts', preview: 'export { postsApi } from "./api/postsApi";\nexport { PostList } from "./components/PostList";\nexport { PostCard } from "./components/PostCard";' }
                            ]
                        }
                    ]
                },
                {
                    name: 'hooks',
                    type: 'folder',
                    children: [
                        { name: 'useMuiSnackbar.ts', type: 'file', size: 980, ext: 'ts', preview: 'import { useSnackbar } from "notistack";\n\nexport const useMuiSnackbar = () => {\n  const { enqueueSnackbar } = useSnackbar();\n  return {\n    showSuccess: (msg) => enqueueSnackbar(msg, { variant: "success" }),\n    showError: (msg) => enqueueSnackbar(msg, { variant: "error" }),\n  };\n};' },
                        { name: 'useDebounce.ts', type: 'file', size: 620, ext: 'ts', preview: 'import { useState, useEffect } from "react";\n\nexport const useDebounce = <T>(value: T, delay: number): T => {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debouncedValue;\n};' }
                    ]
                },
                {
                    name: 'lib',
                    type: 'folder',
                    children: [
                        { name: 'apiClient.ts', type: 'file', size: 1400, ext: 'ts', preview: 'import axios from "axios";\n\nexport const apiClient = axios.create({\n  baseURL: import.meta.env.VITE_API_URL,\n  withCredentials: true,\n  headers: { "Content-Type": "application/json" },\n});\n\napiClient.interceptors.response.use(\n  (res) => res.data,\n  (err) => Promise.reject(err)\n);' },
                        { name: 'queryClient.ts', type: 'file', size: 780, ext: 'ts', preview: 'import { QueryClient } from "@tanstack/react-query";\n\nexport const queryClient = new QueryClient({\n  defaultOptions: {\n    queries: {\n      staleTime: 5 * 60 * 1000,\n      retry: 1,\n    },\n  },\n});' }
                    ]
                },
                {
                    name: 'routes',
                    type: 'folder',
                    children: [
                        { name: 'index.tsx', type: 'file', size: 560, ext: 'tsx', preview: 'import { createFileRoute } from "@tanstack/react-router";\nimport { lazy } from "react";\n\nconst HomePage = lazy(() => import("@/features/home/components/HomePage"));\n\nexport const Route = createFileRoute("/")({ component: HomePage });' },
                        { name: 'posts', type: 'folder', children: [
                            { name: 'index.tsx', type: 'file', size: 680, ext: 'tsx', preview: 'import { createFileRoute } from "@tanstack/react-router";\nimport { lazy } from "react";\nimport { SuspenseLoader } from "~components/SuspenseLoader";\n\nconst PostList = lazy(() => import("~features/posts"));\n\nexport const Route = createFileRoute("/posts/")({ component: () => <SuspenseLoader><PostList /></SuspenseLoader> });' },
                            { name: '$postId.tsx', type: 'file', size: 820, ext: 'tsx', preview: 'import { createFileRoute } from "@tanstack/react-router";\nimport { lazy } from "react";\n\nconst PostDetail = lazy(() => import("~features/posts/components/PostDetail"));\n\nexport const Route = createFileRoute("/posts/$postId")({ \n  component: PostDetail,\n  loader: ({ params }) => ({ crumb: "Post " + params.postId }),\n});' }
                        ]}
                    ]
                },
                {
                    name: 'types',
                    type: 'folder',
                    children: [
                        { name: 'post.ts', type: 'file', size: 320, ext: 'ts', preview: 'export interface Post {\n  id: number;\n  title: string;\n  content: string;\n  authorId: number;\n  createdAt: string;\n  updatedAt: string;\n}' },
                        { name: 'user.ts', type: 'file', size: 280, ext: 'ts', preview: 'export interface User {\n  id: number;\n  email: string;\n  name: string;\n  avatar?: string;\n  role: "admin" | "user";\n}' }
                    ]
                },
                { name: 'App.tsx', type: 'file', size: 1100, ext: 'tsx', preview: 'import { RouterProvider } from "@tanstack/react-router";\nimport { QueryClientProvider } from "@tanstack/react-query";\nimport { queryClient } from "./lib/queryClient";\nimport { router } from "./router";\n\nexport const App = () => (\n  <QueryClientProvider client={queryClient}>\n    <RouterProvider router={router} />\n  </QueryClientProvider>\n);' },
                { name: 'main.tsx', type: 'file', size: 420, ext: 'tsx', preview: 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport { App } from "./App";\nimport "./index.css";\n\nReactDOM.createRoot(document.getElementById("root")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);' }
            ]
        },
        { name: 'package.json', type: 'file', size: 1800, ext: 'json', preview: '{\n  "name": "claude-tool-use",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "@tanstack/react-query": "^5.0.0",\n    "@tanstack/react-router": "^1.0.0",\n    "@mui/material": "^7.0.0"\n  }\n}' },
        { name: 'tsconfig.json', type: 'file', size: 680, ext: 'json', preview: '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "lib": ["ES2020", "DOM"],\n    "module": "ESNext",\n    "strict": true,\n    "paths": {\n      "@/*": ["./src/*"],\n      "~types": ["./src/types"],\n      "~components/*": ["./src/components/*"],\n      "~features/*": ["./src/features/*"]\n    }\n  }\n}' },
        { name: 'vite.config.ts', type: 'file', size: 920, ext: 'ts', preview: 'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport path from "path";\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n      "~types": path.resolve(__dirname, "./src/types"),\n    },\n  },\n});' },
        { name: 'README.md', type: 'file', size: 2400, ext: 'md', preview: '# Claude Tool Use\n\nA modern React application demonstrating best practices for:\n- Suspense-based data fetching\n- Feature-based file organization\n- TanStack Query & Router\n- MUI v7 styling\n\n## Getting Started\n\nnpm install\nnpm run dev' },
        { name: 'index.html', type: 'file', size: 520, ext: 'html', preview: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Claude Tool Use</title>\n</head>\n<body>\n  <main>Claude Tool Use History</main>\n  <div id="root"></div>\n</body>\n</html>' }
    ]
};
