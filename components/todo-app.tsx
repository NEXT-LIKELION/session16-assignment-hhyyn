"use client"

import { useState, useEffect } from "react"
import { Plus, ListFilter, Calendar, Edit, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getTodos, addTodo, updateTodo, deleteTodo, toggleTodoComplete, Todo as TodoType, TodoInput } from "@/lib/todosService"
import { Timestamp } from "firebase/firestore"

export default function TodoApp() {
  const [todos, setTodos] = useState<TodoType[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  
  // 수정 관련 상태 추가
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<TodoType | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDeadline, setEditDeadline] = useState("")

  // Firestore에서 todos 불러오기
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true)
        const todoData = await getTodos()
        setTodos(todoData)
      } catch (error) {
        console.error("Todos 불러오기 오류:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodos()
  }, [])

  // Todo 추가하기
  const handleAddTodo = async () => {
    if (!title.trim()) return

    try {
      const newTodoInput: TodoInput = {
        title,
        description,
        deadline: deadline || new Date().toISOString().split("T")[0],
      }

      const newTodoId = await addTodo(newTodoInput)
      
      // UI 업데이트를 위해 임시로 생성 시간을 현재로 설정
      const newTodo: TodoType = {
        id: newTodoId,
        ...newTodoInput,
        createdAt: Timestamp.now(),
      }

      setTodos([newTodo, ...todos])
      setTitle("")
      setDescription("")
      setDeadline("")
    } catch (error) {
      console.error("Todo 추가 오류:", error)
    }
  }

  // Todo 삭제하기
  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id)
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error("Todo 삭제 오류:", error)
    }
  }

  // 수정할 Todo 설정 및 모달 열기
  const handleEditTodo = (todo: TodoType) => {
    setEditingTodo(todo)
    setEditTitle(todo.title)
    setEditDescription(todo.description)
    setEditDeadline(todo.deadline)
    setIsEditModalOpen(true)
  }

  // Todo 업데이트하기
  const handleUpdateTodo = async () => {
    if (!editingTodo || !editTitle.trim()) return

    try {
      const updatedTodo: Partial<TodoInput> = {
        title: editTitle,
        description: editDescription,
        deadline: editDeadline,
      }

      await updateTodo(editingTodo.id, updatedTodo)
      
      // 로컬 상태 업데이트
      setTodos(todos.map(todo => 
        todo.id === editingTodo.id 
          ? { ...todo, ...updatedTodo } 
          : todo
      ))
      
      // 모달 닫기 및 상태 초기화
      setIsEditModalOpen(false)
      setEditingTodo(null)
    } catch (error) {
      console.error("Todo 업데이트 오류:", error)
    }
  }

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "연도. 월. 일."

    const [year, month, day] = dateString.split("-")
    return `${year}. ${month}. ${day}.`
  }

  // 수정 모달에서 날짜 선택기 처리
  const handleEditShowDatePicker = () => {
    const dateInput = document.getElementById("edit-date-input") as HTMLInputElement
    if (dateInput) {
      dateInput.click()
    }
  }

  // 정렬된 Todo 목록
  const getSortedTodos = () => {
    if (sortBy === "newest") {
      return [...todos].sort((a, b) => {
        return b.createdAt?.toMillis() - a.createdAt?.toMillis()
      })
    } else if (sortBy === "oldest") {
      return [...todos].sort((a, b) => {
        return a.createdAt?.toMillis() - b.createdAt?.toMillis()
      })
    } else if (sortBy === "deadline") {
      return [...todos].sort((a, b) => {
        return a.deadline.localeCompare(b.deadline)
      })
    }
    return todos
  }

  // showPicker 호출 안전하게 처리
  const handleShowDatePicker = () => {
    const dateInput = document.getElementById("date-input") as HTMLInputElement
    if (dateInput) {
      // modern browsers에서 click 이벤트 발생시키기
      dateInput.click()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-indigo-500 mb-2">ToDo.</h1>
          <p className="text-gray-600">할 일을 효율적으로 관리하고 마감일을 놓치지 마세요.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Left Card - Add Todo Form */}
          <Card className="p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500 text-white p-2 rounded-full">
                <Plus size={20} />
              </div>
              <h2 className="text-xl font-medium">새 할 일 추가하기</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-gray-500 text-sm">제목</span>
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-blue-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <Input
                    className="pl-10"
                    placeholder="할 일의 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <span className="text-gray-500 text-sm">세부사항</span>
                </div>
                <Textarea
                  className="min-h-[120px]"
                  placeholder=""
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-gray-500 text-sm">마감 기한</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-blue-500">
                    <Calendar size={20} />
                  </div>
                  <Input
                    type="text"
                    className="pl-10"
                    placeholder="연도. 월. 일."
                    value={formatDateDisplay(deadline)}
                    onClick={handleShowDatePicker}
                    readOnly
                  />
                  <Input
                    id="date-input"
                    type="date"
                    className="opacity-0 absolute inset-0 w-full cursor-pointer"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                  <div className="absolute right-3 top-3">
                    <button
                      className="text-gray-400"
                      onClick={handleShowDatePicker}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 3L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M16 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-indigo-500 hover:bg-indigo-600 mt-4"
                onClick={handleAddTodo}
                disabled={!title.trim()}
              >
                <Plus size={20} className="mr-2" />
                추가하기
              </Button>
            </div>
          </Card>

          {/* Right Card - Todo List */}
          <Card className="p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-400 text-white p-2 rounded-full">
                <ListFilter size={20} />
              </div>
              <h2 className="text-xl font-medium">할 일 목록</h2>
            </div>

            <div className="flex justify-end mb-6">
              <div className="w-full max-w-[220px]">
                <div className="text-sm text-gray-500 mb-1">정렬 기준</div>
                <Select defaultValue="newest" onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                      >
                        <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M10 18H14" stroke="currentColor" strokeLinecap="round" />
                      </svg>
                      <SelectValue placeholder="등록순" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">등록순</SelectItem>
                    <SelectItem value="oldest">오래된순</SelectItem>
                    <SelectItem value="deadline">마감일순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">로딩 중...</div>
                ) : todos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">할 일이 없습니다. 새 할 일을 추가해보세요.</div>
                ) : (
                  getSortedTodos().map((todo) => (
                    <div key={todo.id} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{todo.title}</h3>
                        <div className="flex space-x-2">
                          <button 
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => handleEditTodo(todo)}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => handleDeleteTodo(todo.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        <div className="flex">
                          <span className="w-16">내용:</span>
                          <span>{todo.description}</span>
                        </div>
                        <div className="flex">
                          <span className="w-16">마감일:</span>
                          <span>{todo.deadline}</span>
                        </div>
                      </div>
                      <button className="text-indigo-500 text-sm hover:underline">자세히 보기</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Todo Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">할 일 수정하기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-gray-500 text-sm">제목</span>
                <span className="text-red-500 ml-1">*</span>
              </div>
              <Input
                placeholder="할 일의 제목을 입력하세요"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2">
                <span className="text-gray-500 text-sm">세부사항</span>
              </div>
              <Textarea
                className="min-h-[120px]"
                placeholder=""
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <span className="text-gray-500 text-sm">마감 기한</span>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-3 text-blue-500">
                  <Calendar size={20} />
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="연도. 월. 일."
                  value={formatDateDisplay(editDeadline)}
                  onClick={handleEditShowDatePicker}
                  readOnly
                />
                <Input
                  id="edit-date-input"
                  type="date"
                  className="opacity-0 absolute inset-0 w-full cursor-pointer"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>취소</Button>
            <Button 
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={handleUpdateTodo}
              disabled={!editTitle.trim()}
            >
              수정 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
