<?php if (!defined('ABSPATH')) { exit; }
// Blog listing
get_header(); ?>

<div class="container content">
  <h1><?php _e('Blog', 'saraivavision'); ?></h1>
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <article <?php post_class(); ?>>
      <h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
      <div class="entry-meta"><?php echo get_the_date(); ?></div>
      <div class="entry-content"><?php the_excerpt(); ?></div>
    </article>
    <hr />
  <?php endwhile; the_posts_pagination(); else: ?>
    <p><?php _e('Nenhuma postagem encontrada.', 'saraivavision'); ?></p>
  <?php endif; ?>
</div>

<?php get_footer();

