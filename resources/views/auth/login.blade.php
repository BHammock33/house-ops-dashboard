<x-guest-layout>
    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

       <!-- Password -->
<div class="mt-4" x-data="{ show: false }">
    <x-input-label for="password" :value="__('Password')" />

    <div class="relative">
        <x-text-input
            id="password"
            x-ref="pw"
            class="block mt-1 w-full pr-10"
            type="password"
            name="password"
            required
            autocomplete="current-password"
        />

        <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
            @click="show = !show; $refs.pw.type = show ? 'text' : 'password'"
            :aria-label="show ? 'Hide password' : 'Show password'"
            :aria-pressed="show.toString()"
        >
            <!-- Eye (show) -->
            <svg x-show="!show" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.01 9.963 7.178.07.207.07.431 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.01-9.964-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>

            <!-- Eye slash (hide) -->
            <svg x-show="show" style="display:none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.036 12.322a1.012 1.012 0 0 0 0 .644C3.423 16.49 7.36 19.5 12 19.5c1.767 0 3.437-.437 4.902-1.208M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.638 0 8.573 3.01 9.963 7.178.07.207.07.431 0 .644a10.525 10.525 0 0 1-4.43 5.497M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 0 0-4.243-4.243m4.243 4.243a3 3 0 0 1-4.243-4.243" />
            </svg>
        </button>
    </div>

    <x-input-error :messages="$errors->get('password')" class="mt-2" />
</div>

        <!-- Remember Me -->
        <div class="block mt-4">
            <label for="remember_me" class="inline-flex items-center">
                <input id="remember_me" type="checkbox" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" name="remember">
                <span class="ms-2 text-sm text-gray-600">{{ __('Remember me') }}</span>
            </label>
        </div>

        <div class="flex items-center justify-between mt-4">
           <p class="text-sm text-gray-600">
            Forgot your password already? Text Bennett and he can reset it or remind you.
            </p>
            <x-primary-button class="ms-3">
                {{ __('Log in') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout>
