import React from 'react'
import Input from './components/input'

export default function Home() {
  return (
    <div
      style={{ backgroundColor: 'white' }}
      className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'
    >
      <h1 className='text-2xl font-bold text-center text-gray-800 row-start-1'>Real Time Editing</h1>
      <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
        <Input />
      </main>
    </div>
  )
}
