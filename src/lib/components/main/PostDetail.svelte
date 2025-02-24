<script>
    export let post = {
        imageUrl: '',
        title: '',
        blogName: '',
        date: '',
        content: ''
    };

    // 현재 URL을 가져오기 위한 변수
    let currentUrl = '';
    if (typeof window !== 'undefined') {
        currentUrl = window.location.href;
    }

    // content에서 첫 160자를 추출하여 description으로 사용
    $: description = post.content?.slice(0, 160) || '';
</script>

<svelte:head>
    <title>{post.title} - Velopers</title>
    <meta property="og:title" content={post.title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={post.imageUrl} />
    <meta property="og:url" content={currentUrl} />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Velopers" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={post.title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={post.imageUrl} />
</svelte:head>

<div class="post-detail">
    {#if post.imageUrl}
        <div class="post-image">
            <img src={post.imageUrl} alt={post.title} />
        </div>
    {/if}
    
    <h1 class="post-title">{post.title}</h1>
    
    <div class="post-meta">
        <span class="blog-name">{post.blogName}</span>
        <span class="post-date">{post.date}</span>
    </div>
    
    <div class="post-content">
        {post.content}
    </div>
</div>

<style>
    .post-detail {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .post-image {
        width: 100%;
        margin-bottom: 2rem;
    }

    .post-image img {
        width: 100%;
        height: auto;
        border-radius: 8px;
    }

    .post-title {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
        color: #333;
    }

    .post-meta {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        color: #666;
    }

    .blog-name {
        font-weight: 600;
    }

    .post-content {
        line-height: 1.8;
        color: #444;
    }
</style> 