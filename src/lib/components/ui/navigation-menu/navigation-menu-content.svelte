<script lang="ts">
  import { cn } from "$lib/utils";
  import { getContext } from 'svelte';

  let className: string | undefined = undefined;
  export { className as class };

  const context = getContext('navigation-menu-item');
  const isOpen = context?.isOpen;

  function handleContentClick() {
    if (isOpen) {
      isOpen.set(false);
    }
  }
</script>

{#if $isOpen}
  <div 
    on:click={handleContentClick}
    role="menu"
    tabindex="-1"
    class={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
      className
    )}
    {...$$restProps}
  >
    <slot />
  </div>
{/if}