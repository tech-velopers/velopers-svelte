<script lang="ts">
    import { page } from '$app/stores';
    import PostDetail from '$lib/components/main/PostDetail.svelte';
    
    let post = {
        imageUrl: 'https://example.com/image.jpg',
        title: '게시글 제목',
        blogName: '블로그 이름',
        date: '2024-01-10',
        content: '게시글 내용'
    };

    // TODO: id를 이용해 서버에서 게시글 데이터를 가져오는 로직 추가
    const postId = $page.params.id;
</script>

<PostDetail {post} /> 