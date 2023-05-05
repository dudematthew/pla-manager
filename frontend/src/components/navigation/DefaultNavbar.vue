<script>
import IconVue from '@/components/other/Icon.vue';
import {
    mdiFacebook,
} from '@mdi/js'

export default {
    components: {
        IconVue,
    },
    data() {
        return {
            mdiFacebook,
        }
    },
}
</script>

<template>
    <header class="bg-dark-500 text-white shadow-lg h-24 hidden md:flex">
        <a href="" class="flex-shrink-0 flex items-center justify-center px-4 lg:px-6 xl:px-8">
            <img class="h-20 w-20" src="@/assets/img/logo.png" alt="" />
        </a>
        <nav class="header-links contents font-semibold text-base lg:text-lg">
            <ul class="flex items-center ml-4 xl:ml-8 mr-auto">
                <li class="p-3 xl:p-6 active">
                    <a href="">
                        <span>Strona Główna</span>
                    </a>
                </li>
                <li class="p-3 xl:p-6">
                    <a href="">
                        <span>Turnieje</span>
                    </a>
                </li>
                <li class="p-3 xl:p-6">
                    <a href="https://dsc.gg/polskie-legendy-apex" target="_blank">
                        <span>Discord</span>
                    </a>
                </li>
                <li class="p-3 xl:p-6">
                    <a href="" class="flex items-center">
                        <span>Pages</span>
                        <svg class="h-3 opacity-30 ml-2 svg-inline--fa fa-chevron-down fa-w-14 fa-7x" aria-hidden="true"
                            focusable="false" data-prefix="far" data-icon="chevron-down" role="img"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path fill="currentColor"
                                d="M441.9 167.3l-19.8-19.8c-4.7-4.7-12.3-4.7-17 0L224 328.2 42.9 147.5c-4.7-4.7-12.3-4.7-17 0L6.1 167.3c-4.7 4.7-4.7 12.3 0 17l209.4 209.4c4.7 4.7 12.3 4.7 17 0l209.4-209.4c4.7-4.7 4.7-12.3 0-17z">
                            </path>
                        </svg>
                    </a>
                </li>
            </ul>
        </nav>
        <nav class="hidden xl:contents">
            <ul class="flex items-center mr-4 lg:mr-6 xl:mr-8">
                <!-- <li class="p-1">
            <a href=""
              class="inline-block rounded-full border p-2 hover:shadow-lg hover:border-opacity-0 duration-200 hover:-translate-y-0.5">
              <svg class="h-4 svg-inline--fa fa-twitter fa-w-16 fa-9x" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="twitter" role="img"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor"
                  d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z">
                </path>
              </svg>
            </a>
          </li> -->
                <li class="p-1">
                    <a href=""
                        class="inline-block rounded-full border p-1 hover:shadow-lg hover:border-opacity-0 duration-200 hover:-translate-y-0.5">
                        <IconVue :icon="mdiFacebook" size="25"></IconVue>
                    </a>
                </li>
                <li class="p-1">
                    <a href=""
                        class="inline-block rounded-full border p-2 hover:shadow-lg hover:border-opacity-0 duration-200 hover:-translate-y-0.5">
                    </a>
                </li>
                <li class="p-1">
                    <a href=""
                        class="inline-block rounded-full border p-2 hover:shadow-lg hover:border-opacity-0 duration-200 hover:-translate-y-0.5">
                        <IconVue :icon="mdiFacebook" size="25"></IconVue>
                    </a>
                </li>
            </ul>
        </nav>
        <div class="flex items-center px-4 lg:px-6 xl:px-8">
            <!-- <a href="" class="mr-4 lg:mr-6 xl:mr-8">
          <svg class="h-6 xl:h-8 svg-inline--fa fa-search fa-w-16 fa-3x" aria-hidden="true" focusable="false" data-prefix="far" data-icon="search" role="img"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path fill="currentColor"
              d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z">
            </path>
          </svg>
        </a> -->
            <button class="bg-white hover:bg-gray-200 text-black font-bold px-4 xl:px-6 py-2 xl:py-3 rounded">
                Zaloguj się
            </button>
        </div>
    </header>
</template>