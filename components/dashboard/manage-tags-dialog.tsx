"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTagsStore } from "@/store/tags-store";
import { Loader2, Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ManageTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableColors = [
  { id: "blue-500", label: "Blue", class: "bg-blue-500/10 text-blue-500" },
  { id: "blue-600", label: "Dark Blue", class: "bg-blue-600/10 text-blue-600" },
  { id: "violet-500", label: "Violet", class: "bg-violet-500/10 text-violet-500" },
  { id: "cyan-500", label: "Cyan", class: "bg-cyan-500/10 text-cyan-500" },
  { id: "emerald-500", label: "Emerald", class: "bg-emerald-500/10 text-emerald-500" },
  { id: "amber-500", label: "Amber", class: "bg-amber-500/10 text-amber-500" },
  { id: "green-500", label: "Green", class: "bg-green-500/10 text-green-500" },
  { id: "rose-500", label: "Rose", class: "bg-rose-500/10 text-rose-500" },
  { id: "pink-500", label: "Pink", class: "bg-pink-500/10 text-pink-500" },
  { id: "indigo-500", label: "Indigo", class: "bg-indigo-500/10 text-indigo-500" },
  { id: "foreground", label: "Foreground", class: "bg-foreground/10 text-foreground" },
];

const defaultTagColor = "bg-blue-500/10 text-blue-500";

export function ManageTagsDialog({
  open,
  onOpenChange,
}: ManageTagsDialogProps) {
  const { tags, addTag, updateTag, deleteTag } = useTagsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    color: defaultTagColor, // Changed initial default color
  });

  const handleAdd = async () => {
    if (!formData.name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await addTag({
        name: formData.name,
        color: formData.color,
      });

      setFormData({
        name: "",
        color: defaultTagColor, // Changed default color
      });
      setIsAdding(false);
      toast.success("Tag added successfully"); // Added toast
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag"); // Added toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => { // Removed 'id' parameter, using editingId from state
    if (!editingId || !formData.name.trim() || isLoading) return; // Added editingId check

    setIsLoading(true);
    try {
      await updateTag(editingId, { // Used editingId
        name: formData.name,
        color: formData.color,
      });

      setEditingId(null);
      setFormData({
        name: "",
        color: defaultTagColor, // Changed default color
      });
      toast.success("Tag updated successfully"); // Added toast
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error("Failed to update tag"); // Added toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isLoading) return; // Added isLoading check
    if (confirm("Are you sure you want to delete this tag?")) {
      setIsLoading(true);
      try {
        await deleteTag(id);
        toast.success("Tag deleted successfully"); // Added toast
      } catch (error) {
        console.error("Error deleting tag:", error);
        toast.error("Failed to delete tag"); // Added toast
      } finally {
        setIsLoading(false);
        // If we deleted the actively edited item, clear edit state
        if (editingId === id) {
          setEditingId(null);
          setFormData({ name: "", color: defaultTagColor }); // Changed default color
        }
      }
    }
  };

  const startEditing = (tag: any) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      color: tag.color,
    });
    setIsAdding(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: "", color: "bg-blue-500/10 text-blue-500" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add, edit, or delete your bookmark tags.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add New Tag Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            {!isAdding ? (
              <Button
                onClick={() => setIsAdding(true)}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Plus className="size-4 mr-2" />
                Add New Tag
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">New Tag</Label>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={cancelEditing}
                    disabled={isLoading}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-name" className="text-xs">
                      Name
                    </Label>
                    <Input
                      id="new-name"
                      placeholder="Tag name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Color</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {availableColors.map((colorOption) => (
                        <button
                          key={colorOption.id}
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            setFormData({ ...formData, color: colorOption.class })
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all border-2",
                            colorOption.class,
                            formData.color === colorOption.class
                              ? "border-foreground scale-105"
                              : "border-transparent",
                            isLoading && "opacity-50 cursor-not-allowed"
                          )}
                          title={colorOption.label}
                        >
                          {colorOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAdd} className="w-full" size="sm" disabled={isLoading}>
                    <Check className="size-4 mr-2" />
                    {isLoading ? "Adding..." : "Add Tag"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Tags List */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              EXISTING TAGS
            </Label>
            <div className="space-y-2">
              {tags.map((tag) => {
                const isEditing = editingId === tag.id;

                return (
                  <div
                    key={tag.id}
                    className="border rounded-lg p-3 bg-background"
                  >
                    {!isEditing ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-medium",
                              tag.color
                            )}
                          >
                            {tag.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tag.count} bookmarks
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => startEditing(tag)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(tag.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">
                            Edit Tag
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={cancelEditing}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`edit-name-${tag.id}`} className="text-xs">
                              Name
                            </Label>
                            <Input
                              id={`edit-name-${tag.id}`}
                              placeholder="Tag name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Color</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {availableColors.map((colorOption) => (
                                <button
                                  key={colorOption.id}
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      color: colorOption.class,
                                    })
                                  }
                                  className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all border-2",
                                    colorOption.class,
                                    formData.color === colorOption.class
                                      ? "border-foreground scale-105"
                                      : "border-transparent"
                                  )}
                                  title={colorOption.label}
                                >
                                  {colorOption.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleUpdate()}
                            className="w-full"
                            size="sm"
                          >
                            <Check className="size-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
