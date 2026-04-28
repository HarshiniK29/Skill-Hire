import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

import { useState, useEffect } from "react";
import { supabase } from "./utils/supabase";

const queryClient = new QueryClient();

type Todo = {
  id: number;
  name: string;
};

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    async function getTodos() {
      const { data, error } = await supabase
        .from("todos")
        .select("*");

      if (error) {
        console.error("Error fetching todos:", error);
        return;
      }

      if (data) {
        setTodos(data);
      }
    }

    getTodos();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>

            {/* Debug display for Supabase data */}
            {todos.length > 0 && (
              <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
                <h3 className="mb-2 text-sm font-semibold text-white">
                  Supabase Todos
                </h3>

                <ul className="space-y-1 text-sm text-slate-300">
                  {todos.map((todo) => (
                    <li key={todo.id}>• {todo.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/auth/callback" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;