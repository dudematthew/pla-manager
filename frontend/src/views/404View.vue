<template>
    <main class="h-screen w-full flex flex-col justify-center items-center bg-[#1A2238]">
        <!-- <h1 class="text-9xl font-extrabold text-white tracking-widest">404</h1> -->
        <img src="@/assets/img/logo.png" alt="404" class="w-[250px] h-[250px]" />
        <div class="bg-[#ff0000] px-2 text-lg rounded rotate-12 mb-12 absolute">
            404: Nie znaleziono strony
        </div>
        <button class="mt-5">
            <a
                class="relative inline-block text-sm font-medium text-[#FF6A3D] group active:text-orange-500 focus:outline-none focus:ring">
                <span
                    class="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] group-hover:translate-y-0 group-hover:translate-x-0"></span>

                <span class="relative block px-8 py-3 bg-[#1A2238] border border-current">
                    <router-link to="/">Strona Główna</router-link>
                </span>
            </a>
        </button>
    </main>
</template>