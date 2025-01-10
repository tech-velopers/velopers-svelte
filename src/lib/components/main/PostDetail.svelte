<script>
    export let post = {
        imageUrl: '',
        title: '',
        blogName: '',
        date: '',
        content: ''
    };
</script>

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