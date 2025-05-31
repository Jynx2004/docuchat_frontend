'use client'

import React, { useState, useRef, useEffect } from 'react'
import { EditorState } from 'prosemirror-state'
import { schema } from 'prosemirror-schema-basic'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { EditorView } from 'prosemirror-view'
import jsPDF from 'jspdf'

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo, initProseMirrorDoc } from 'y-prosemirror'

export default function Join() {
  const [inputValue, setInputValue] = useState('')
  const [connected, setConnected] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const ydocRef = useRef<Y.Doc | null>(null)

  // Fetch all existing room names from backend
  const getExistingRooms = async (): Promise<string[]> => {
    try {
      const response = await fetch('https://docuchat-backend-eqtx.onrender.com/api/doc/rooms')
      if (!response.ok) throw new Error('Failed to fetch rooms')
      const data = await response.json()
      return data.rooms || [] // assuming backend sends { rooms: ['room1', 'room2', ...] }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      return []
    }
  }

  const handleSave = async () => {
    if (!ydocRef.current || !inputValue) return
    await saveDoc(inputValue, ydocRef.current)
  }

  // Save/update existing document (called on Save button click)
  const saveDoc = async (roomName: string, ydoc: Y.Doc) => {
    try {
      const stateAsUint8Array = Y.encodeStateAsUpdate(ydoc)
      //const base64State = Buffer.from(stateAsUint8Array).toString('base64')
      const base64State = btoa(String.fromCharCode(...stateAsUint8Array))

      const response = await fetch(`https://docuchat-backend-eqtx.onrender.com/api/doc/save/${roomName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ydocState: base64State })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to save document')
      }

      alert('Document saved successfully!')
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Failed to save document.')
    }
  }

  //   useEffect(() => {
  //     if (!connected || !editorRef.current) return

  //     if (connected) {
  //       const ydoc = new Y.Doc()

  //       async function joinroomfunction() {
  //         // Fetch Base64 Yjs doc state from backend
  //         try {
  //           const response = await fetch(`http://localhost:4000/api/doc/${inputValue}`)
  //           if (!response.ok) throw new Error('Failed to fetch document')
  //           const data = await response.json()

  //           if (data.ydocState) {
  //             const binaryUpdate = Uint8Array.from(atob(data.ydocState), c => c.charCodeAt(0))
  //             Y.applyUpdate(ydoc, binaryUpdate)
  //           }
  //         } catch (error) {
  //           console.error('Error loading Yjs doc from backend:', error)
  //           alert('Failed to load initial document content')
  //           return
  //         }
  //       }

  //       joinroomfunction()

  //       const provider = new WebsocketProvider('wss://demos.yjs.dev/ws', inputValue, ydoc)
  //       const yXmlFragment = ydoc.getXmlFragment('prosemirror')

  //       const { doc, mapping } = initProseMirrorDoc(yXmlFragment, schema)

  //       const state = EditorState.create({
  //         doc,
  //         schema,
  //         plugins: [
  //           ySyncPlugin(yXmlFragment, { mapping }),
  //           yCursorPlugin(provider.awareness),
  //           yUndoPlugin(),
  //           keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo }),
  //           keymap(baseKeymap),
  //           ...exampleSetup({ schema })
  //         ]
  //       })

  //       const view = new EditorView(editorRef.current!, { state })

  //       viewRef.current = view
  //       providerRef.current = provider
  //       ydocRef.current = ydoc
  //       // Logic to run when connected
  //     }
  //   }, [connected])

  useEffect(() => {
    if (!connected || !editorRef.current) return

    //const ydoc = new Y.Doc()

    // async function joinroomfunction() {
    //   try {
    //     const ydoc = new Y.Doc()
    //     const ydoc1 = new Y.Doc()
    //     const response = await fetch(`https://docuchat-backend-eqtx.onrender.com/api/doc/${inputValue}`)
    //     if (!response.ok) throw new Error('Failed to fetch document')
    //     const data = await response.json()

    //     if (data.ydocState) {
    //       const binaryUpdate = Uint8Array.from(atob(data.ydocState), c => c.charCodeAt(0))
    //       Y.applyUpdate(ydoc, binaryUpdate)
    //     }

    //     const provider = new WebsocketProvider('wss://demos.yjs.dev/ws', inputValue, ydoc)
    //     const yXmlFragment = ydoc.getXmlFragment('prosemirror')
    //     const { doc, mapping } = initProseMirrorDoc(yXmlFragment, schema)

    //     let view: EditorView | null = null

    //     const state = EditorState.create({
    //       doc,
    //       schema,
    //       plugins: [
    //         ySyncPlugin(yXmlFragment, { mapping }),
    //         yCursorPlugin(provider.awareness),
    //         yUndoPlugin(),
    //         keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo }),
    //         keymap(baseKeymap),
    //         ...exampleSetup({ schema })
    //       ]
    //     })

    //     //const view = new EditorView(editorRef.current!, { state })
    //     view = new EditorView(editorRef.current, {
    //       state,
    //       dispatchTransaction(transaction) {
    //         if (view) {
    //           const newState = view.state.apply(transaction)
    //           view.updateState(newState)
    //           console.log('Editor updated:', newState.doc.toJSON())
    //         }
    //       }
    //     })

    //     viewRef.current = view
    //     providerRef.current = provider
    //     ydocRef.current = ydoc

    //     return () => {
    //       viewRef.current?.destroy()
    //       providerRef.current?.destroy()
    //       ydocRef.current?.destroy()
    //       viewRef.current = null
    //       providerRef.current = null
    //       ydocRef.current = null
    //     }
    //   } catch (error) {
    //     console.error('Error loading Yjs doc from backend:', error)
    //     alert('Failed to load initial document content')
    //   }
    // }

    async function joinroomfunction() {
      try {
        const ydoc = new Y.Doc()
        const response = await fetch(`https://docuchat-backend-eqtx.onrender.com/api/doc/${inputValue}`)
        if (!response.ok) throw new Error('Failed to fetch document')
        const data = await response.json()

        const provider = new WebsocketProvider('wss://demos.yjs.dev/ws', inputValue, ydoc)
        await new Promise(resolve => {
          provider.once('sync', resolve) // Wait for provider to sync with other peers
        })

        if (data.ydocState) {
          const binaryUpdate = Uint8Array.from(atob(data.ydocState), c => c.charCodeAt(0))
          Y.transact(
            ydoc,
            () => {
              Y.applyUpdate(ydoc, binaryUpdate)
            },
            'load-initial-doc'
          )
        }

        const yXmlFragment = ydoc.getXmlFragment('prosemirror')
        const { doc, mapping } = initProseMirrorDoc(yXmlFragment, schema)

        let view: EditorView | null = null

        const state = EditorState.create({
          doc,
          schema,
          plugins: [
            ySyncPlugin(yXmlFragment, { mapping }),
            yCursorPlugin(provider.awareness),
            yUndoPlugin(),
            keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo }),
            keymap(baseKeymap),
            ...exampleSetup({ schema })
          ]
        })

        view = new EditorView(editorRef.current, {
          state,
          dispatchTransaction(transaction) {
            if (view) {
              const newState = view.state.apply(transaction)
              view.updateState(newState)
              console.log('Editor updated:', newState.doc.toJSON())
            }
          }
        })

        viewRef.current = view
        providerRef.current = provider
        ydocRef.current = ydoc

        return () => {
          viewRef.current?.destroy()
          providerRef.current?.destroy()
          ydocRef.current?.destroy()
          viewRef.current = null
          providerRef.current = null
          ydocRef.current = null
        }
      } catch (error) {
        console.error('Error loading Yjs doc from backend:', error)
        alert('Failed to load initial document content')
      }
    }

    joinroomfunction()
  }, [connected])

  const handleDownload = () => {
    if (!viewRef.current) return
    const text = viewRef.current.state.doc.textContent
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${inputValue || 'document'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = () => {
    if (!viewRef.current) return
    const text = viewRef.current.state.doc.textContent
    const doc = new jsPDF()
    doc.text(text, 10, 10)
    doc.save(`${inputValue || 'document'}.pdf`)
  }

  async function JoinToRoom() {
    if (!inputValue) {
      alert('Please enter a room name')
      return
    }

    // Check if room exists before creating new one
    const existingRooms = await getExistingRooms()
    if (!existingRooms.includes(inputValue)) {
      alert('Room does not exist, please choose another one.')
      return
    }

    setConnected(true)

    // Logic to connect to the room
  }

  const disconnectFromRoom = () => {
    viewRef.current?.destroy()
    providerRef.current?.destroy()
    ydocRef.current?.destroy()

    setConnected(false)
  }

  return (
    <>
      <div
        style={{ backgroundColor: 'white' }}
        className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-5 gap-16 font-[family-name:var(--font-geist-sans)]'
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className='text-2xl font-bold text-center text-gray-800 row-start-1'>Real Time Editing</h1>
          <h1 className='text-2xl font-bold text-center text-gray-800 row-start-1'>Join</h1>
        </div>
      </div>
      <label htmlFor='input' className='text-sm font-medium text-black'>
        Enter the Room Name
      </label>
      <input
        type='text'
        id='input'
        className='border border-gray-300 text-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        onChange={e => setInputValue(e.target.value)}
        value={inputValue}
      />
      <div className='flex gap-2'>
        <button onClick={JoinToRoom} className='bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600'>
          Join
        </button>
        {connected && (
          <button onClick={disconnectFromRoom} className='bg-red-500 text-white rounded-md p-2 hover:bg-red-600'>
            Disconnect
          </button>
        )}
        {connected && (
          <button onClick={handleSave} className='bg-green-500 text-white rounded-md p-2 hover:bg-green-600'>
            Save
          </button>
        )}
      </div>

      {/* {connected && <div ref={editorRef} className='border mt-4 p-4 text-black rounded-md min-h-[300px]' />} */}

      {connected && (
        <>
          <style>
            {`
              .pm-editor-toolbar {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 8px 8px 0 0;
                padding: 6px 12px;
                margin-bottom: 0;
                min-height: 40px;
                flex-wrap: wrap;
              }
              .pm-editor .ProseMirror-menubar,
              .pm-editor .ProseMirror-menubar-wrapper {
                all: unset;
                display: flex;
              }
              .pm-editor .ProseMirror {
                width: 300px;
                min-height: 300px;
                outline: none;
                background: #f9fafb;
                border-radius: 0 0 8px 8px;
                padding: 16px;
                font-size: 1rem;
                color: #222;
                box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                border: 1px solid #e5e7eb;
                border-top: none;
                font-family: 'Inter', 'Segoe UI', 'Arial', sans-serif;
                line-height: 1.7;
                word-break: break-word;
              }
              .pm-editor .ProseMirror-selectednode {
                outline: 2px solid #2563eb;
              }
              .pm-editor .ProseMirror-menuitem {
                margin: 0 2px;
                border-radius: 4px;
                transition: background 0.15s;
                padding: 4px 8px;
                background: transparent;
                border: none;
                cursor: pointer;
                font-size: 1rem;
              }
              .pm-editor .ProseMirror-menuitem:hover {
                background: #e0e7ef;
              }
              .pm-editor .ProseMirror-menu-active {
                background: #2563eb;
                color: #fff;
              }
              .pm-editor .ProseMirror {
                scrollbar-width: thin;
                scrollbar-color: #a0aec0 #f9fafb;
              }
              .pm-editor .ProseMirror::-webkit-scrollbar {
                height: 8px;
                width: 8px;
                background: #f9fafb;
              }
              .pm-editor .ProseMirror::-webkit-scrollbar-thumb {
                background: #a0aec0;
                border-radius: 4px;
              }
            `}
          </style>
          <div className='pm-editor mt-4 rounded-md shadow'>
            {/* Move toolbar controls to a single line above the editor */}
            <div className='pm-editor-toolbar'>
              {/* ProseMirror's menu bar will be rendered here by plugins */}
              {/* You can add your own controls here if needed */}
            </div>
            <div ref={editorRef} />
          </div>
        </>
      )}

      {/* <div>
        {connected && (
          <button onClick={handleDownload} className='bg-yellow-500 text-white rounded-md p-2 hover:bg-yellow-600'>
            Download
          </button>
        )}
      </div> */}
      <div>
        {connected && (
          <>
            <button onClick={handleDownload} className='bg-yellow-500 text-white rounded-md p-2 hover:bg-yellow-600'>
              Download
            </button>
            <button onClick={handleDownloadPDF} className='bg-purple-500 text-white rounded-md p-2 hover:bg-purple-600'>
              Download PDF
            </button>
          </>
        )}
      </div>
    </>
  )
}
