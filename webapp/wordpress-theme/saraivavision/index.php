<?php if (!defined('ABSPATH')) { exit; }
get_header(); ?>

<div class="container content">
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <article <?php post_class(); ?>>
      <h1 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
      <div class="entry-meta"><?php echo get_the_date(); ?></div>
      <div class="entry-content">
        <?php the_excerpt(); ?>
      </div>
    </article>
    <hr />
  <?php endwhile; else: ?>
    <p><?php _e('Nenhum conteúdo encontrado.', 'saraivavision'); ?></p>
  <?php endif; ?>

  <div class="pagination">
    <?php the_posts_pagination(); ?>
  </div>
</div>

<?php get_footer();

