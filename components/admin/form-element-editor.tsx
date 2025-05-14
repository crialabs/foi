"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Trash,
  Plus,
  MoveVertical,
  Type,
  Hash,
  CalendarIcon,
  ListFilter,
  CheckSquare,
  AlignLeft,
  Phone,
  Mail,
  User,
} from "lucide-react"

// Available form elements
const availableElements = [
  { type: "text", icon: <Type className="h-5 w-5" />, label: "Text Field" },
  { type: "name", icon: <User className="h-5 w-5" />, label: "Name Field" },
  { type: "email", icon: <Mail className="h-5 w-5" />, label: "Email Field" },
  { type: "phone", icon: <Phone className="h-5 w-5" />, label: "Phone Field" },
  { type: "number", icon: <Hash className="h-5 w-5" />, label: "Number Field" },
  { type: "date", icon: <CalendarIcon className="h-5 w-5" />, label: "Date Field" },
  { type: "textarea", icon: <AlignLeft className="h-5 w-5" />, label: "Text Area" },
  { type: "checkbox", icon: <CheckSquare className="h-5 w-5" />, label: "Checkbox" },
  { type: "select", icon: <ListFilter className="h-5 w-5" />, label: "Select" },
]

// Define the type for the form element state
type FormElementState = {
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

// Define the type for the element in the form
type ElementInForm = FormElementState & {
  id: string
}

// Function to generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15)
}

// Component to manage the form element editor
const FormElementEditor = () => {
  // State for the elements in the form
  const [elements, setElements] = useState<ElementInForm[]>([])

  // Function to add a new element to the form
  const addElement = (type: string) => {
    const newElement: ElementInForm = {
      id: generateId(),
      type: type,
      label: "New Element",
      required: false,
    }
    setElements([...elements, newElement])
  }

  // Function to update an element in the form
  const updateElement = (id: string, updatedValues: Partial<FormElementState>) => {
    setElements(elements.map((element) => (element.id === id ? { ...element, ...updatedValues } : element)))
  }

  // Function to delete an element from the form
  const deleteElement = (id: string) => {
    setElements(elements.filter((element) => element.id !== id))
  }

  // Function to handle drag end
  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(elements)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setElements(items)
  }

  return (
    <div className="flex flex-col space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="form-elements">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {elements.map((element, index) => (
                <Draggable key={element.id} draggableId={element.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="border p-4 rounded-md bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MoveVertical className="h-4 w-4 text-gray-500" />
                          <span>
                            {element.label} ({element.type})
                          </span>
                        </div>
                        <Button variant="destructive" size="icon" onClick={() => deleteElement(element.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        <Label htmlFor={`${element.id}-label`}>Label</Label>
                        <Input
                          id={`${element.id}-label`}
                          value={element.label}
                          onChange={(e) => updateElement(element.id, { label: e.target.value })}
                        />
                        <Label htmlFor={`${element.id}-required`}>Required</Label>
                        <Switch
                          id={`${element.id}-required`}
                          checked={element.required}
                          onCheckedChange={(checked) => updateElement(element.id, { required: checked })}
                        />
                        {element.type === "text" && (
                          <>
                            <Label htmlFor={`${element.id}-placeholder`}>Placeholder</Label>
                            <Input
                              id={`${element.id}-placeholder`}
                              placeholder="Placeholder"
                              onChange={(e) => updateElement(element.id, { placeholder: e.target.value })}
                            />
                          </>
                        )}
                        {element.type === "textarea" && (
                          <>
                            <Label htmlFor={`${element.id}-placeholder`}>Placeholder</Label>
                            <Textarea
                              id={`${element.id}-placeholder`}
                              placeholder="Placeholder"
                              onChange={(e) => updateElement(element.id, { placeholder: e.target.value })}
                            />
                          </>
                        )}
                        {element.type === "select" && (
                          <>
                            <Label htmlFor={`${element.id}-options`}>Options (comma-separated)</Label>
                            <Input
                              id={`${element.id}-options`}
                              placeholder="Option 1, Option 2, Option 3"
                              onChange={(e) => updateElement(element.id, { options: e.target.value.split(",") })}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Element
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-2">
            {availableElements.map((element) => (
              <Button
                key={element.type}
                variant="ghost"
                className="justify-start"
                onClick={() => addElement(element.type)}
              >
                {element.icon}
                <span>{element.label}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default FormElementEditor
