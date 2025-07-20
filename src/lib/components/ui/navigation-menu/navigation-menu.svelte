<script lang="ts">
  import { cn } from "$lib/utils";

  let className: string | undefined = undefined;
  export { className as class };
</script>

<nav class={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)} {...$$restProps}>
  <div class="group flex flex-1 list-none items-center justify-center space-x-1">
    <slot />
  </div>
</nav>