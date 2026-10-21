import { Button } from "../ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { useNavigate } from "react-router-dom"
import { useForm } from "@tanstack/react-form"
import { z } from 'zod'
import { useRegisterUserMutation } from "../../state/auth/authApiSlice"
import { useDispatch } from "react-redux"
import { setCredentials } from "../../state/auth/authSlice"

const inputSchema = z.object({
    name: z.string().max(100),
    email: z.email().max(255),
    password_hash: z.string().min(6).max(255)
})

export const RegisterPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [registerUser] = useRegisterUserMutation()

    const form = useForm({
        defaultValues:{
            name: '',
            email: '',
            password_hash: ''
        },
        onSubmit: async ({value}) => {
            const result = await registerUser(inputSchema.parse(value)).unwrap()
            dispatch(setCredentials({usertoken: result.usertoken}))

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
                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} id="name" type="string" placeholder="Full name" />
                            )}
                        </form.Field>
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <form.Field name="email">
                            {(field) => (
                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} id="email" type="email" placeholder="user@example.com" />
                            )}
                        </form.Field>
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
                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} id="password" type="password" placeholder="password" />
                            )}
                        </form.Field>
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