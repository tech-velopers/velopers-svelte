<script lang="ts">
	import { buttonVariants, type Variant, type Size } from ".";
	import { cn } from "$lib/utils";

	type $Props = {
		href?: string;
		variant?: Variant;
		size?: Size;
		class?: string;
	} & (
		| import('svelte/elements').HTMLButtonAttributes
		| import('svelte/elements').HTMLAnchorAttributes
	);

	let className: $Props["class"] = undefined;
	export { className as class };
	export let variant: Variant = "default";
	export let size: Size = "default";
	export let href: $Props["href"] = undefined;
</script>

{#if href}
	<a {href} class="{cn(buttonVariants({ variant, size, class: className }))}" {...$$restProps}>
		<slot />
	</a>
{:else}
	<button class="{cn(buttonVariants({ variant, size, class: className }))}" on:click {...$$restProps}>
		<slot />
	</button>
{/if}