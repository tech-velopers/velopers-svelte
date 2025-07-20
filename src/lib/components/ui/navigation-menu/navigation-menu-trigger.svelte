<script lang="ts">
  import { cn } from "$lib/utils";
  import { ChevronDown } from "lucide-svelte";
  import { getContext } from 'svelte';

  let className: string | undefined = undefined;
  export { className as class };
  export let href: string | undefined = undefined;
  export let showChevron: boolean = true;

  const context = getContext('navigation-menu-item');
  const isOpen = context?.isOpen;

  function toggleDropdown() {
    if (isOpen) {
      isOpen.update(value => !value);
    }
  }
</script>

{#if href}
  <a 
    {href}
    class={cn(
      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
      className
    )}
    {...$$restProps}
  >
    <slot />
    {#if showChevron}
      <ChevronDown class="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
    {/if}
  </a>
{:else}
  <button
    on:click={toggleDropdown}
    class={cn(
      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
      $isOpen && "bg-accent/50",
      className
    )}
    {...$$restProps}
  >
    <slot />
    {#if showChevron}
      <ChevronDown class={cn("relative top-[1px] ml-1 h-3 w-3 transition duration-200", $isOpen && "rotate-180")} aria-hidden="true" />
    {/if}
  </button>
{/if}