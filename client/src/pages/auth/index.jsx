import { useState } from "react";
import {useNavigate} from 'react-router-dom';
import Background from "@/assets/crewchat_login.png";
import Victory from "@/assets/victory.svg";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { SIGNUP_ROUTE, CHECK_USER_ROUTE, LOGIN_ROUTE } from "@/utils/constants";
import Cookies from "js-cookie";
import { useAppStore } from "@/store";

const Auth = () => {
    const navigate = useNavigate();
    const {setUserInfo} = useAppStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassWord, setConfirmPassWord] = useState("");

  const validateLogin = () => {
    if(!email.length) {
        toast.error("Email is required!");
        return false;
    }
    if (!password.length) {
        toast.error("Password is required!");
        return false;
    }
    return true;
  }

  const validateSignup = () => {
    if(!email.length) {
        toast.error("Email is required!");
        return false;
    }
    if (!password.length) {
        toast.error("Password is required!");
        return false;
    }

    if (password !== confirmPassWord) {
        toast.error("Passwords do not match!");
        return false;
    }
    return true;
  }

  const handleLogin = async ()=> {
    try {
        if (validateLogin()) {
            const response = await apiClient.post(LOGIN_ROUTE, {email, password}, {withCredentials: true});
            console.log(response.data);
            if(response.data.user.id) {
                setUserInfo(response.data.user);
                if (response.data.user.profileSetup) {
                    navigate("/chat");
                } else {
                    navigate("/profile");
                }
            }
            toast.success("Login successful!");
        }
    } catch(error) {
        console.log("Login failed: ", error);
        toast.error("Login failed, please try again!");
    }
  };

  const handleSignup = async ()=> {
    try {
        if (validateSignup()) {
            // Check if user already exists
            const checkUserResponse = await apiClient.get(CHECK_USER_ROUTE, {
                params: { email }
            });
            
            if (checkUserResponse.data.exists) {
                toast.error("Email is already registered.");
                return;
            }
  
          // Proceed with signup if user does not exist
            const response = await apiClient.post(SIGNUP_ROUTE, {email, password}, {withCredentials: true});
            console.log(response.data);
            if (response.status === 201) {
                setUserInfo(response.data.user);
                navigate("/profile");
            }
            toast.success("Signup successful!");
        }
    } catch(error) {
        console.log("Signup failed: ", error);
        toast.error("Signup failed, please try again.");
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
            <div className="flex items-center justify-center flex-col">
                <div className="flex items-center justify-center">
                    <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
                    <img src={Victory} alt="victory emoji" className="h-[100px]"/>
                </div>
                <p className="font-medium text-center">FIll in your details to get started with Crew Chat!</p>
            </div>
            <div className="flex items-center justify-center w-full">
                <Tabs className="w-3/4" defaultValue="login">
                    <TabsList className="bg-transparent rounded-none w-full">
                        <TabsTrigger value="login" className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300">Signup</TabsTrigger>
                    </TabsList>
                    <TabsContent className="flex flex-col gap-5 mt-10" value="login">
                        <Input placeholder="Email" type="email" className="rounded-full p-6" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input placeholder="Password" type="password" className="rounded-full p-6" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button className="rounded-full p-6" onClick={handleLogin}>Login</Button>
                    </TabsContent>
                    <TabsContent className="flex flex-col gap-5" value="signup">
                        <Input placeholder="Email" type="email" className="rounded-full p-6" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input placeholder="Password" type="password" className="rounded-full p-6" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Input placeholder="Confirm Password" type="password" className="rounded-full p-6" value={confirmPassWord} onChange={(e) => setConfirmPassWord(e.target.value)} />
                        <Button className="rounded-full p-6" onClick={handleSignup}>Signup</Button>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
            <img src={Background} alt="picasso-looking pirate image for the login screen" className="h-[700px]" />
        </div>
      </div>
    </div>
  )
}

export default Auth
