import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getSingleAssignment,
  updateAssignment,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function TeacherAssignmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    maxMarks: 100,
    dueDate: "",
  });

  useEffect(() => {
    const fetch = async () => {
      const res = await getSingleAssignment(id!);
      const a = res.data.assignment;

      setForm({
        title: a.title,
        description: a.description,
        maxMarks: a.maxMarks,
        dueDate: a.dueDate?.slice(0, 16),
      });
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateAssignment(id!, form);
      toast({
        title: "Assignment Updated",
        description: "The assignment has been updated successfully.",
      });
      navigate(`/assignments/${id}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Update Failed",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Edit Assignment</h1>

      <form onSubmit={handleUpdate} className="space-y-4">

        {/* Title */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            placeholder="Enter assignment title"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Enter assignment description"
          />
        </div>

        {/* Max Marks */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Max Marks</label>
          <Input
            type="number"
            value={form.maxMarks}
            onChange={(e) =>
              setForm({ ...form, maxMarks: Number(e.target.value) })
            }
            placeholder="Enter max marks"
          />
        </div>

        {/* Due Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Due Date</label>
          <Input
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <Button type="submit" className="w-full">
          Update Assignment
        </Button>
      </form>
    </div>
  );
}