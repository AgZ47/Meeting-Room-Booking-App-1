import { Button } from "../../common/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../common/ui/card"
import { Input } from "../../common/ui/input"
import { useNavigate } from "react-router-dom"
import { useForm } from "@tanstack/react-form"
import { z } from 'zod'
import { useRegisterUserMutation } from "./api/authApiSlice"
import { useDispatch } from "react-redux"
import { setCredentials } from "./api/authSlice"
import { Label } from "../../common/ui/label"
import { useState } from "react"

const inputSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email().max(255),
    password_hash: z.string().min(6).max(255)
})

export const RegisterPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [registerUser] = useRegisterUserMutation()
    const [nameError, setNameError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const form = useForm({
        defaultValues:{
            name: '',
            email: '',
            password_hash: ''
        },
        onSubmit: async ({value}) => {
            setNameError("")
            setEmailError("")
            setPasswordError("")

            const parseResult = inputSchema.safeParse(value)
            parseResult.error?.issues.map((issue) => {
                if(issue.path[0] === "email"){
                    setEmailError(issue.message)
                }
                if(issue.path[0] === "password_hash"){
                    setPasswordError(issue.message)
                }
                if(issue.path[0] === "name"){
                    setNameError(issue.message)
                }
            })

            if(!parseResult.success){
                return
            }

            // const result = await registerUser(inputSchema.parse(value)).unwrap()
            // dispatch(setCredentials({usertoken: result.usertoken, name: result.name, role: result.role}))

        }
    })

    return(
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
                <CardAction>
                <Button onClick={() => navigate('/')}>Login</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form id="login-form" onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <label htmlFor="email">Name</label>
                        <form.Field name="name">
                            {(field) => (
                            <Input value={field.state.value} onChange={(e) => {field.handleChange(e.target.value); setNameError("")}} id="name" type="string" placeholder="Full name" />
                            )}
                        </form.Field>
                        {nameError && <div className="p-2 my-1 bg-red-100 outline-2 outline-red-400 rounded-lg flex flex-row gap-2">
                            <Label>Name error</Label>
                            <Label className="mt-1 text-xs text-muted-foreground">{nameError}</Label>
                        </div>}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <form.Field name="email">
                            {(field) => (
                            <Input value={field.state.value} onChange={(e) => {field.handleChange(e.target.value); setEmailError("")}} id="email" type="email" placeholder="user@example.com" />
                            )}
                        </form.Field>
                        {emailError && <div className="p-2 my-1 bg-red-100 outline-2 outline-red-400 rounded-lg flex flex-row gap-2">
                            <Label>Email error</Label>
                            <Label className="mt-1 text-xs text-muted-foreground">{emailError}</Label>
                        </div>}
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <label htmlFor="password">Password</label>
                            <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                            Forgot your password?
                            </a>
                        </div>
                        <form.Field name="password_hash">
                            {(field) => (
                            <Input value={field.state.value} onChange={(e) => {field.handleChange(e.target.value); setPasswordError("")}} id="password" type="password" placeholder="password" />
                            )}
                        </form.Field>
                        {passwordError && <div className="p-2 my-1 bg-red-100 outline-2 outline-red-400 rounded-lg flex flex-row gap-2">
                            <Label>Password error</Label>
                            <Label className="mt-1 text-xs text-muted-foreground">{passwordError}</Label>
                        </div>}
                    </div>
                </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button type='submit' form="login-form">Submit</Button>
            </CardFooter>
            </Card>
        </div>
    )
}