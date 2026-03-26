import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getSingleAssignment,
  updateAssignment,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TeacherAssignmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

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

    await updateAssignment(id!, form);
    navigate(`/assignments/${id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Edit Assignment</h1>

      <form onSubmit={handleUpdate} className="space-y-3">
        <Input
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <Textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <Input
          type="number"
          value={form.maxMarks}
          onChange={(e) =>
            setForm({ ...form, maxMarks: Number(e.target.value) })
          }
        />

        <Input
          type="datetime-local"
          value={form.dueDate}
          onChange={(e) =>
            setForm({ ...form, dueDate: e.target.value })
          }
        />

        <Button type="submit">Update</Button>
      </form>
    </div>
  );
}