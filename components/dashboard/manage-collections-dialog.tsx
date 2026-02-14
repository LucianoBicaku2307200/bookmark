"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCollectionsStore } from "@/store/collections-store";
import {
  Palette,
  Code,
  Wrench,
  BookOpen,
  Sparkles,
  Folder,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManageCollectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableIcons = [
  { id: "palette", icon: Palette, label: "Palette" },
  { id: "code", icon: Code, label: "Code" },
  { id: "wrench", icon: Wrench, label: "Wrench" },
  { id: "book-open", icon: BookOpen, label: "Book" },
  { id: "sparkles", icon: Sparkles, label: "Sparkles" },
  { id: "folder", icon: Folder, label: "Folder" },
];

const availableColors = [
  { id: "violet", label: "Violet", class: "bg-violet-500" },
  { id: "blue", label: "Blue", class: "bg-blue-500" },
  { id: "amber", label: "Amber", class: "bg-amber-500" },
  { id: "emerald", label: "Emerald", class: "bg-emerald-500" },
  { id: "pink", label: "Pink", class: "bg-pink-500" },
  { id: "cyan", label: "Cyan", class: "bg-cyan-500" },
  { id: "rose", label: "Rose", class: "bg-rose-500" },
  { id: "indigo", label: "Indigo", class: "bg-indigo-500" },
];

export function ManageCollectionsDialog({
  open,
  onOpenChange,
}: ManageCollectionsDialogProps) {
  const { collections, addCollection, updateCollection, deleteCollection } =
    useCollectionsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "folder",
    color: "blue",
  });

  const handleAdd = async () => {
    if (!formData.name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await addCollection({
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
      });

      setFormData({ name: "", icon: "folder", color: "slate" });
      setIsAdding(false);
      toast.success("Collection added successfully");
    } catch (error) {
      console.error("Error adding collection:", error);
      toast.error("Failed to add collection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await updateCollection(editingId, {
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
      });

      setEditingId(null);
      setFormData({ name: "", icon: "folder", color: "slate" });
      toast.success("Collection updated successfully");
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Failed to update collection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isLoading) return;
    if (confirm("Are you sure you want to delete this collection?")) {
      setIsLoading(true);
      try {
        await deleteCollection(id);
        toast.success("Collection deleted successfully");
      } catch (error) {
        console.error("Error deleting collection:", error);
        toast.error("Failed to delete collection");
      } finally {
        setIsLoading(false);
        // If we deleted the actively edited item (rare but possible), clear edit state
        if (editingId === id) {
          setEditingId(null);
          setFormData({ name: "", icon: "folder", color: "blue" });
        }
      }
    }
  };

  const startEditing = (collection: any) => {
    setEditingId(collection.id);
    setFormData({
      name: collection.name,
      icon: collection.icon,
      color: collection.color,
    });
    setIsAdding(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: "", icon: "folder", color: "blue" });
  };

  const editableCollections = collections.filter((c) => c.id !== "all");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Collections</DialogTitle>
          <DialogDescription>
            Add, edit, or delete your bookmark collections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add New Collection Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            {!isAdding ? (
              <Button
                onClick={() => setIsAdding(true)}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Plus className="size-4 mr-2" />
                Add New Collection
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    New Collection
                  </Label>
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
                      placeholder="Collection name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Icon</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {availableIcons.map((iconOption) => {
                        const IconComponent = iconOption.icon;
                        return (
                          <button
                            key={iconOption.id}
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              setFormData({ ...formData, icon: iconOption.id })
                            }
                            className={cn(
                              "p-2 rounded-md border transition-colors",
                              formData.icon === iconOption.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted",
                              isLoading && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <IconComponent className="size-4" />
                          </button>
                        );
                      })}
                    </div>
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
                            setFormData({ ...formData, color: colorOption.id })
                          }
                          className={cn(
                            "size-8 rounded-md border-2 transition-all",
                            colorOption.class,
                            formData.color === colorOption.id
                              ? "border-foreground scale-110"
                              : "border-transparent",
                            isLoading && "opacity-50 cursor-not-allowed"
                          )}
                          title={colorOption.label}
                        />
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAdd} className="w-full" size="sm" disabled={isLoading}>
                    <Check className="size-4 mr-2" />
                    {isLoading ? "Adding..." : "Add Collection"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Collections List */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              EXISTING COLLECTIONS
            </Label>
            <div className="space-y-2">
              {editableCollections.map((collection) => {
                const IconComponent =
                  availableIcons.find((i) => i.id === collection.icon)?.icon ||
                  Folder;
                const isEditing = editingId === collection.id;

                return (
                  <div
                    key={collection.id}
                    className="border rounded-lg p-3 bg-background"
                  >
                    {!isEditing ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "size-8 rounded-md flex items-center justify-center",
                              `bg-${collection.color}-500/10`
                            )}
                          >
                            <IconComponent
                              className={cn(
                                "size-4",
                                `text-${collection.color}-500`
                              )}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {collection.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {collection.count} bookmarks
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => startEditing(collection)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(collection.id)}
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
                            Edit Collection
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
                            <Label htmlFor={`edit-name-${collection.id}`} className="text-xs">
                              Name
                            </Label>
                            <Input
                              id={`edit-name-${collection.id}`}
                              placeholder="Collection name"
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
                            <Label className="text-xs">Icon</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {availableIcons.map((iconOption) => {
                                const IconComponent = iconOption.icon;
                                return (
                                  <button
                                    key={iconOption.id}
                                    type="button"
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        icon: iconOption.id,
                                      })
                                    }
                                    className={cn(
                                      "p-2 rounded-md border transition-colors",
                                      formData.icon === iconOption.id
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-muted"
                                    )}
                                  >
                                    <IconComponent className="size-4" />
                                  </button>
                                );
                              })}
                            </div>
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
                                      color: colorOption.id,
                                    })
                                  }
                                  className={cn(
                                    "size-8 rounded-md border-2 transition-all",
                                    colorOption.class,
                                    formData.color === colorOption.id
                                      ? "border-foreground scale-110"
                                      : "border-transparent"
                                  )}
                                  title={colorOption.label}
                                />
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
