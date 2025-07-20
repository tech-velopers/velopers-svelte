<script lang="ts">
  import { cn } from "$lib/utils";
  import { setContext, onMount } from 'svelte';
  import { writable } from 'svelte/store';

  let className: string | undefined = undefined;
  export { className as class };
  
  const isOpen = writable(false);
  setContext('navigation-menu-item', { isOpen });

  let menuRef: HTMLLIElement;

  onMount(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef && !menuRef.contains(event.target as Node)) {
        isOpen.set(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<li bind:this={menuRef} class={cn("relative", className)} {...$$restProps}>
  <slot />
</li>