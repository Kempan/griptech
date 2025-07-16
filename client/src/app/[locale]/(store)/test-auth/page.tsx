'use client'

import { useState } from 'react'

export default function TestAuthPage() {
	const [results, setResults] = useState<any[]>([])
	const [loading, setLoading] = useState(false)

	const addResult = (step: string, data: any) => {
		setResults(prev => [...prev, { step, data, timestamp: new Date().toISOString() }])
	}

	const testAuth = async () => {
		setLoading(true)
		setResults([])

		try {
			// Test 1: Check session before login
			addResult('1. Session before login', 'Testing...')
			const sessionBefore = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/session`, {
				credentials: 'include'
			})
			const sessionBeforeData = await sessionBefore.json()
			addResult('1. Session before login', sessionBeforeData)

			// Test 2: Login
			addResult('2. Login attempt', 'Testing...')
			const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					email: 'joakim@tundran.se',
					password: 'admin'
				})
			})
			const loginData = await loginResponse.json()
			addResult('2. Login response', loginData)

			// Test 3: Check session after login
			addResult('3. Session after login', 'Testing...')
			const sessionAfter = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/session`, {
				credentials: 'include'
			})
			const sessionAfterData = await sessionAfter.json()
			addResult('3. Session after login', sessionAfterData)

			// Test 4: Check cookies in browser
			addResult('4. Browser cookies', document.cookie || 'No cookies found')

		} catch (error) {
			addResult('Error', error instanceof Error ? error.message : 'Unknown error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-6">Authentication Test</h1>
			
			<div className="mb-6">
				<button 
					onClick={testAuth}
					disabled={loading}
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
				>
					{loading ? 'Testing...' : 'Run Authentication Test'}
				</button>
			</div>

			<div className="space-y-4">
				{results.map((result, index) => (
					<div key={index} className="border rounded p-4 bg-gray-50">
						<h3 className="font-bold text-lg mb-2">{result.step}</h3>
						<pre className="bg-white p-3 rounded text-sm overflow-auto">
							{JSON.stringify(result.data, null, 2)}
						</pre>
						<p className="text-xs text-gray-500 mt-2">
							{new Date(result.timestamp).toLocaleTimeString()}
						</p>
					</div>
				))}
			</div>

			{results.length > 0 && (
				<div className="mt-6 p-4 bg-blue-50 rounded">
					<h3 className="font-bold mb-2">Analysis:</h3>
					<ul className="list-disc list-inside space-y-1 text-sm">
						<li>If session before login shows <code>isLoggedIn: false</code> ✅</li>
						<li>If login response shows user data ✅</li>
						<li>If session after login shows <code>isLoggedIn: true</code> ✅ Cross-domain working</li>
						<li>If session after login shows <code>isLoggedIn: false</code> ❌ Cross-domain issue</li>
						<li>Check browser cookies to see if they were set</li>
					</ul>
				</div>
			)}
		</div>
	)
} 