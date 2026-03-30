import { useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo, type Todo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ArrowLeft, Calendar, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Fetch todos on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true);
        const res = await getTodos();
        setTodos(res.data.todos);
      } catch (err) {
        console.error("Failed to load todos:", err);
        toast({
          title: "Load Failed",
          description: "Failed to load todos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [toast]);

  // Add new todo
  const handleAddTodo = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }
    if (!dueDate) {
      toast({
        title: "Validation Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await createTodo({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate,
      });
      setTodos([...todos, res.data]);
      setTitle("");
      setDescription("");
      setDueDate("");
      toast({
        title: "Todo Created",
        description: "Your new todo has been added successfully.",
      });
    } catch (err) {
      console.error("Failed to create todo:", err);
      toast({
        title: "Creation Failed",
        description: "Failed to create todo",
        variant: "destructive",
      });
    }
  };

  // Toggle todo completion
  const handleToggleTodo = async (todo: Todo) => {
    try {
      const res = await updateTodo(todo._id, {
        completed: !todo.completed,
      });
      setTodos(todos.map((t) => (t._id === todo._id ? res.data : t)));
      const status = !todo.completed ? "marked as complete" : "marked as pending";
      toast({
        title: "Todo Updated",
        description: `Todo has been ${status}.`,
      });
    } catch (err) {
      console.error("Failed to update todo:", err);
      toast({
        title: "Update Failed",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  // Delete todo
  const handleDeleteTodo = (id: string) => {
    setDeleteConfirm({
      open: true,
      title: "Delete Todo",
      description: "Are you sure you want to delete this todo? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteTodo(id);
          setTodos(todos.filter((t) => t._id !== id));
          toast({
            title: "Todo Deleted",
            description: "Your todo has been deleted successfully.",
          });
        } catch (err) {
          console.error("Failed to delete todo:", err);
          toast({
            title: "Deletion Failed",
            description: "Failed to delete todo",
            variant: "destructive",
          });
        }
      },
    });
  };

  // Update todo (Edit)
  const handleUpdateTodo = async (id: string) => {
    try {
      const res = await updateTodo(id, {
        title: editTitle,
        description: editDescription,
      });
      setTodos(todos.map(t => (t._id === id ? res.data : t)));
      setEditingTodoId(null);
      toast({
        title: "Todo Updated",
        description: "Your todo has been updated successfully.",
      });
    } catch (err) {
      console.error("Failed to update todo:", err);
      toast({
        title: "Update Failed",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Check if date is overdue
  const isOverdue = (dateString: string) => {
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today;
    } catch {
      return false;
    }
  };

  // Separate todos by status
  const completedTodos = todos.filter((t) => t.completed);
  const pendingTodos = todos.filter((t) => !t.completed);
  const overdueTodos = pendingTodos.filter((t) => isOverdue(t.dueDate));
  const upcomingTodos = pendingTodos.filter((t) => !isOverdue(t.dueDate));

  // Card actions block
  const TodoCardActions = (todo: Todo) => (
    <div className="flex gap-1 mt-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Edit"
        onClick={() => {
          setEditingTodoId(todo._id);
          setEditTitle(todo.title);
          setEditDescription(todo.description);
        }}
      >
        <Pencil className="w-4 h-4 text-blue-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete"
        onClick={() => handleDeleteTodo(todo._id)}
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );

  // Card main body (handles edit state)
  const TodoCardContent = (todo: Todo) => (
    <div className="flex-1">
      {editingTodoId === todo._id ? (
        <div className="flex flex-col gap-2">
          <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="mb-1" />
          <textarea
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground"
            rows={2}
          />
          <div className="flex gap-2 mt-1">
            <Button
              size="sm"
              onClick={async () => {
                await handleUpdateTodo(todo._id);
              }}>
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingTodoId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-semibold">{todo.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Due: {formatDate(todo.dueDate)}</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
    <div className="flex flex-col min-h-dvh px-4 py-12">
      <div className="mx-auto w-full max-w-2xl flex flex-col gap-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          className="w-fit px-4 h-10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-gradient">Back</span>
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gradient">Todo List</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage your tasks and keep track of your work.
          </p>
        </div>

        {/* Add Todo Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Add New Todo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Todo title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Todo description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background text-foreground"
              rows={4}
            />
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1"
              />
            </div>
            <Button onClick={handleAddTodo} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Todo
            </Button>
          </CardContent>
        </Card>

        {/* Todos Sections */}
        {loading && <p className="text-muted-foreground">Loading...</p>}

        {!loading && todos.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No todos yet. Create one above!
          </p>
        )}

        {!loading && todos.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Overdue Todos */}
            {overdueTodos.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-destructive">
                  ⚠️ Overdue ({overdueTodos.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {overdueTodos.map((todo) => (
                    <Card key={todo._id} className="shadow-md border-l-4 border-l-destructive">
                      <CardContent className="p-4 flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(todo)}
                          className="mt-1 cursor-pointer w-5 h-5"
                        />
                        {TodoCardContent(todo)}
                        {TodoCardActions(todo)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming/Pending Todos */}
            {upcomingTodos.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-accent">
                  📋 Pending ({upcomingTodos.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {upcomingTodos.map((todo) => (
                    <Card key={todo._id} className="shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(todo)}
                          className="mt-1 cursor-pointer w-5 h-5"
                        />
                        {TodoCardContent(todo)}
                        {TodoCardActions(todo)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Todos */}
            {completedTodos.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                  ✓ Completed ({completedTodos.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {completedTodos.map((todo) => (
                    <Card
                      key={todo._id}
                      className="shadow-md bg-muted/50 opacity-75"
                    >
                      <CardContent className="p-4 flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(todo)}
                          className="mt-1 cursor-pointer w-5 h-5"
                        />
                        {TodoCardContent(todo)}
                        {TodoCardActions(todo)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    <ConfirmDialog
      open={deleteConfirm.open}
      onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
      title={deleteConfirm.title}
      description={deleteConfirm.description}
      onConfirm={deleteConfirm.onConfirm}
    />
    </>
  );
}