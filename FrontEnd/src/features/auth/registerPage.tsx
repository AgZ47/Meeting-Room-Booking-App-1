import { Button } from "../../common/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../common/ui/card"
import { Input } from "../../common/ui/input"
import { useNavigate } from "react-router-dom"
import { useForm } from "@tanstack/react-form"
import { z } from 'zod'
import { useRegisterUserMutation } from "./api/authApiService"
import { useDispatch } from "react-redux"
import { setCredentials } from "./api/authSlice"
import { Label } from "../../common/ui/label"
import { useState } from "react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "../../common/ui/empty"
import { LoaderCircle } from "lucide-react"
import { Field, FieldLabel } from "../../common/ui/field"

const inputSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email().max(255),
    password_hash: z.string().min(6).max(255)
})

export const RegisterPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [registerUser, {isLoading}] = useRegisterUserMutation()
    const [nameError, setNameError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const form = useForm({
        defaultValues:{
            name: '',
            email: '',
            password_hash: ''
        },
        validators:{
            onChange: inputSchema
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

            try{

                const result = await registerUser(inputSchema.parse(value)).unwrap()

                dispatch(setCredentials({usertoken: result.usertoken, name: result.name, role: result.role}))
                
                navigate('/rooms')

            }catch(err){
                console.log(err)
            }

        }
    })

    if (isLoading) {
        return (
            <div className="w-full h-dvh flex justify-center items-center">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia>
                            <LoaderCircle className="animate-spin"/>
                        </EmptyMedia>
                        <EmptyTitle>
                            Loading bookings...
                        </EmptyTitle>
                    </EmptyHeader>
                </Empty>
            </div>
        );
    }

    return(
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Enter your credentials to create your account</CardDescription>
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
                        <form.Field name="name">
                            {(field) => (
                                <Field 
                                    data-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                >
                                    <FieldLabel htmlFor="email" className="flex flex-row gap-0">
                                        Name
                                        <p className="text-red-400">
                                            *
                                        </p>
                                    </FieldLabel>
                                    <Input value={field.state.value} onChange={(e) => {field.handleChange(e.target.value); setNameError("")}} id="name" type="string" placeholder="Full name" aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}/>
                                    {!field.state.meta.isValid && field.state.meta.isTouched && (
                                        <div className="text-red-400 font-bold">
                                            {field.state.meta.errors.map((error,index) => (
                                                <p key={index}>
                                                    {typeof error === "string" ? error : error?.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </Field>
                            )}
                        </form.Field>
                        {nameError && <div className="p-2 my-1 bg-red-100 outline-2 outline-red-400 rounded-lg flex flex-row gap-2">
                            <Label>Name error</Label>
                            <Label className="mt-1 text-xs text-muted-foreground">{nameError}</Label>
                        </div>}
                    </div>
                    <div className="grid gap-2">
                        <form.Field name="email">
                            {(field) => (
                                <Field
                                    data-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                >
                                    <FieldLabel htmlFor="email" className="flex flex-row gap-0">
                                        Email
                                        <p className="text-red-400">
                                            *
                                        </p>
                                    </FieldLabel>
                                    <Input value={field.state.value} onChange={(e) => {field.handleChange(e.target.value); setEmailError("")}} id="email" type="email" placeholder="user@example.com" aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}/>
                                    {!field.state.meta.isValid && field.state.meta.isTouched && (
                                        <div className="text-red-400 font-bold">
                                            {field.state.meta.errors.map((error,index) => (
                                                <p key={index}>
                                                    {typeof error === "string" ? error : error?.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </Field>
                            )}
                        </form.Field>
                        {emailError && <div className="p-2 my-1 bg-red-100 outline-2 outline-red-400 rounded-lg flex flex-row gap-2">
                            <Label>Email error</Label>
                            <Label className="mt-1 text-xs text-muted-foreground">{emailError}</Label>
                        </div>}
                    </div>
                    <div className="grid gap-2">
                        <form.Field name="password_hash">
                            {(field) => (
                                <Field
                                    data-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
                                >
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="password" className="flex flex-row gap-0">
                                            Password
                                            <p className="text-red-400">
                                                *
                                            </p>
                                        </FieldLabel>
                                        <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-sky-600">
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input value={field.state.value} onChange={(e) => {field.handleChange(e.target.value); setPasswordError("")}} id="password" type="password" placeholder="password" aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}/>
                                    {!field.state.meta.isValid && field.state.meta.isTouched && (
                                        <div className="text-red-400 font-bold">
                                            {field.state.meta.errors.map((error,index) => (
                                                <p key={index}>
                                                    {typeof error === "string" ? error : error?.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </Field>
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
                <Button type='submit' form="login-form">Sign Up</Button>
            </CardFooter>
            </Card>
        </div>
    )
}