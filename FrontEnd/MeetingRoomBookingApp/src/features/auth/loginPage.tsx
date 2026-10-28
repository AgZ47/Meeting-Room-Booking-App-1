import { Button } from '../../common/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../common/ui/card'
import { Input } from '../../common/ui/input'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useLoginUserMutation } from '../auth/api/authApiSlice'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../auth/api/authSlice'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Label } from '../../common/ui/label'

const inputSchema = z.object({
  email: z.email(),
  password_hash: z.string().min(6).max(255),
})

export const LoginPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loginUser, {isLoading, error, reset}] = useLoginUserMutation();
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const form = useForm({
        defaultValues: {
            email: '',
            password_hash: '',
        },
        onSubmit: async ({ value }) => {
            reset()
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
            })

            try{
                if(!parseResult.success){
                    return 
                }
                const result = await loginUser(parseResult.data).unwrap();

                dispatch(setCredentials({ usertoken: result.usertoken, name: result.name, role: result.role }));

                if(result.role === "admin"){
                    navigate('/admin/bookings');
                }
                if(result.role === "user"){
                    navigate('/rooms')
                }   
            }catch(err){
                console.log("Error: ",err)
            }
        },
    })

    if (isLoading) {
        return (
            <div className="mx-auto flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="size-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                Loading meeting rooms...
            </div>
            </div>
        );
    }

    return(
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
                <CardAction>
                    <Button id='navigate to signup' onClick={() => navigate('/register')}>SignUp</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                {error && <div className='bg-red-200 rounded-lg outline-red-500 outline-2 p-2 my-1'>
                    <Label>Login error</Label>
                    <Label className='mt-1 text-xs text-muted-foreground'>Invalid email or password</Label>
                </div>}
                <form id="login-form" onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <form.Field name="email">
                            {(field) => (
                            <Input value={field.state.value} onChange={(e) => {field.handleChange(e.target.value); setEmailError("")}} id="email" type="email" placeholder="user@example.com" />
                            )}
                        </form.Field>
                        {emailError && <div className='bg-red-200 rounded-lg outline-red-500 outline-2 p-2 my-1 flex flex-row gap-2'>
                            <Label>Email error</Label>
                            <Label className='mt-1 text-xs text-muted-foreground'>{emailError}</Label>
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
                        {passwordError && <div className='bg-red-200 rounded-lg outline-red-500 outline-2 p-2 my-1 flex flex-row gap-2'>
                            <Label>Password error</Label>
                            <Label className='mt-1 text-xs text-muted-foreground'>{passwordError}</Label>
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