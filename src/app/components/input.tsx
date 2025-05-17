'use client'
import React, { useState, useRef } from 'react'
import { EditorState } from 'prosemirror-state'
import { schema } from 'prosemirror-schema-basic'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { EditorView } from 'prosemirror-view'

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo, initProseMirrorDoc } from 'y-prosemirror'

export default function Input() {
  const [inputValue, setInputValue] = useState('')
  const [connected, setConnected] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const ydocRef = useRef<Y.Doc | null>(null)

  // Fetch all existing room names from backend
  const getExistingRooms = async (): Promise<string[]> => {
    try {
      const response = await fetch('http://localhost:4000/api/doc/rooms')
      if (!response.ok) throw new Error('Failed to fetch rooms')
      const data = await response.json()
      return data.rooms || [] // assuming backend sends { rooms: ['room1', 'room2', ...] }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      return []
    }
  }

  // Create new document in backend (called on connect)
  const createNewDoc = async (roomName: string, ydoc: Y.Doc) => {
    try {
      const stateAsUint8Array = Y.encodeStateAsUpdate(ydoc)
      const base64State = Buffer.from(stateAsUint8Array).toString('base64')

      const response = await fetch(`http://localhost:4000/api/doc/create/${roomName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ydocState: base64State })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create new document')
      }

      console.log('New document created successfully')
    } catch (error) {
      console.error('Error creating document:', error)
      alert('Error creating new document')
    }
  }

  // Save/update existing document (called on Save button click)
  const saveDoc = async (roomName: string, ydoc: Y.Doc) => {
    try {
      const stateAsUint8Array = Y.encodeStateAsUpdate(ydoc)
      const base64State = Buffer.from(stateAsUint8Array).toString('base64')

      const response = await fetch(`http://localhost:4000/api/doc/save/${roomName}`, {
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

  const connectToRoom = async () => {
    if (!inputValue) {
      alert('Please enter a room name')
      return
    }

    // Check if room exists before creating new one
    const existingRooms = await getExistingRooms()
    if (existingRooms.includes(inputValue)) {
      alert('Room name already taken, please choose another one.')
      return
    }

    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('wss://demos.yjs.dev/ws', inputValue, ydoc)
    const yXmlFragment = ydoc.getXmlFragment('prosemirror')

    const { doc, mapping } = initProseMirrorDoc(yXmlFragment, schema)

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

    const view = new EditorView(editorRef.current!, { state })

    viewRef.current = view
    providerRef.current = provider
    ydocRef.current = ydoc

    // Create new document entry on backend
    await createNewDoc(inputValue, ydoc)

    setConnected(true)
  }

  const disconnectFromRoom = () => {
    viewRef.current?.destroy()
    providerRef.current?.destroy()
    ydocRef.current?.destroy()

    setConnected(false)
  }

  const handleSave = async () => {
    if (!ydocRef.current || !inputValue) return
    await saveDoc(inputValue, ydocRef.current)
  }

  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor='input' className='text-sm font-medium text-gray-700'>
        Room Name
      </label>
      <input
        type='text'
        id='input'
        className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        onChange={e => setInputValue(e.target.value)}
        value={inputValue}
      />
      <div className='flex gap-2'>
        <button onClick={connectToRoom} className='bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600'>
          Connect
        </button>
        <button onClick={disconnectFromRoom} className='bg-red-500 text-white rounded-md p-2 hover:bg-red-600'>
          Disconnect
        </button>
        {connected && (
          <button onClick={handleSave} className='bg-green-500 text-white rounded-md p-2 hover:bg-green-600'>
            Save
          </button>
        )}
      </div>

      {connected && <div ref={editorRef} className='border mt-4 p-4 rounded-md' />}
    </div>
  )
}
