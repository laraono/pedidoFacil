<script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { User, Menu, X } from "lucide-vue-next";
  import imgLogo from "@/assets/light-logo.png";
  import { useFeaturesStore } from "@/stores/features";
  import { storeToRefs } from "pinia";

  const router = useRouter();
  const isMenuOpen = ref(false);
  const { emailEnabled } = storeToRefs(useFeaturesStore());

  const scrollToSection = (sectionId) => {
    if (router.currentRoute.value.path === "/") {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/").then(() => {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      });
    }
    isMenuOpen.value = false;
  };
</script>

<template>
  <header class="w-full bg-white border-b border-[#E0E0E0] relative z-30">
    <div
      class="flex justify-between items-center px-5 py-3 max-w-[1200px] mx-auto"
    >
      <img
        :src="imgLogo"
        alt="PedidoFácil"
        class="h-9 w-auto object-contain cursor-pointer"
        @click="router.push('/')"
      />

      <nav
        class="hidden md:flex items-center gap-8 text-base font-bold text-[#212121]"
      >
        <a
          @click.prevent="scrollToSection('sobre')"
          class="hover:text-accent transition-colors cursor-pointer"
          >Sobre</a
        >
        <a
          @click.prevent="scrollToSection('planos')"
          class="hover:text-accent transition-colors cursor-pointer"
          >Planos</a
        >
        <a
          v-if="emailEnabled"
          @click.prevent="scrollToSection('contato')"
          class="hover:text-accent transition-colors cursor-pointer"
          >Contato</a
        >
      </nav>

      <div class="hidden md:flex items-center gap-4">
        <button
          @click="router.push('/login')"
          class="flex items-center gap-2 text-[#212121] font-semibold text-base hover:text-accent transition-colors"
        >
          <User :size="18" /> Login
        </button>
        <button
          @click="router.push('/register')"
          class="px-4 py-2 bg-primary text-white font-bold rounded text-sm hover:bg-primary-dark transition-colors"
        >
          Cadastrar
        </button>
      </div>

      <button @click="isMenuOpen = !isMenuOpen" class="md:hidden p-1">
        <component :is="isMenuOpen ? X : Menu" class="w-6 h-6 text-accent" />
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="isMenuOpen"
        class="md:hidden bg-white border-t border-[#E0E0E0] px-5 py-2"
      >
        <a
          @click.prevent="scrollToSection('sobre')"
          class="block py-3 border-b border-[#E0E0E0] text-[#212121] font-bold text-center cursor-pointer hover:text-accent transition-colors"
          >Sobre nós</a
        >
        <a
          @click.prevent="scrollToSection('planos')"
          class="block py-3 border-b border-[#E0E0E0] text-[#212121] font-bold text-center cursor-pointer hover:text-accent transition-colors"
          >Planos</a
        >
        <a
          v-if="emailEnabled"
          @click.prevent="scrollToSection('contato')"
          class="block py-3 border-b border-[#E0E0E0] text-[#212121] font-bold text-center cursor-pointer hover:text-accent transition-colors"
          >Contato</a
        >
        <button
          @click="
            router.push('/login');
            isMenuOpen = false;
          "
          class="block w-full py-3 border-b border-[#E0E0E0] text-accent font-bold text-center"
        >
          Login
        </button>
        <button
          @click="
            router.push('/register');
            isMenuOpen = false;
          "
          class="block w-full py-3 text-primary font-bold text-center"
        >
          Cadastrar
        </button>
      </div>
    </Transition>
  </header>
</template>
