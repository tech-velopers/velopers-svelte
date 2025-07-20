<script lang="ts">
  import { cn } from "$lib/utils";

  let className: string | undefined = undefined;
  export { className as class };
</script>

<ul class={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)} {...$$restProps}>
  <slot />
</ul>