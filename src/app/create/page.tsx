'use client'

import React from 'react'
import Input from '../components/input'
import Link from 'next/link'

export default function Create() {
  return (
    <div
      style={{ backgroundColor: 'white' }}
      className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'
    >
      <h1 className='text-2xl font-bold text-center text-gray-800 row-start-1'>Create Document</h1>
      <nav className='flex gap-4'>
        <Link href='/create' className='text-blue-500 hover:underline'>
          Create Document
        </Link>
        <Link href='/join' className='text-blue-500 hover:underline'>
          Join Document
        </Link>
      </nav>
      <div className='flex flex-col gap-[32px] row-start-2 text-black items-center sm:items-start'>
        {/* Add your create document form or component here */}
        <p>Document creation functionality goes here.</p>
        <Input />
      </div>
    </div>
  )
}
