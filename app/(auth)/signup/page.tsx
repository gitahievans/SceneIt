import { signup } from "../actions";

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-4 mx-auto w-1/3">
    <form className="flex flex-col gap-4">
      <label htmlFor="email" className="text-black">Email:</label>
      <input id="email" name="email" type="email" required className="border border-black rounded-md p-2" />
      <label htmlFor="password" className="text-black">Password:</label>
      <input id="password" name="password" type="password" required className="border border-black rounded-md p-2" />
      <button formAction={signup} className="bg-black hover:bg-black text-white">Sign up</button>
    </form>
    </div>
  )
}