<?php if (!defined('ABSPATH')) { exit; }
get_header(); ?>

<div class="container content">
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <article <?php post_class(); ?>>
      <h1 class="entry-title"><?php the_title(); ?></h1>
      <div class="entry-content"><?php the_content(); ?></div>
    </article>
    <?php comments_template(); ?>
  <?php endwhile; endif; ?>
</div>

<?php get_footer();

