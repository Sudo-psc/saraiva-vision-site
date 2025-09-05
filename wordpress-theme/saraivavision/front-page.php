<?php if (!defined('ABSPATH')) { exit; }
get_header();

$hero_title = get_theme_mod('hero_title', __('Clínica Saraiva Vision', 'saraivavision'));
$hero_sub   = get_theme_mod('hero_subtitle', __('Oftalmologia com tecnologia avançada em Caratinga/MG.', 'saraivavision'));
$cta_label  = get_theme_mod('hero_cta_label', __('Agendar Consulta', 'saraivavision'));
$cta_link   = get_theme_mod('hero_cta_link', 'https://api.whatsapp.com/send?phone=5533998601427');
?>

<section class="hero">
  <div class="container">
    <h1 class="title"><?php echo esc_html($hero_title); ?></h1>
    <p class="subtitle"><?php echo wp_kses_post($hero_sub); ?></p>
    <div class="actions">
      <a class="btn btn-primary" href="<?php echo esc_url($cta_link); ?>" target="_blank" rel="noopener">
        <?php echo esc_html($cta_label); ?>
      </a>
      <a class="btn btn-outline" href="<?php echo esc_url( get_permalink( get_option('page_for_posts') ) ); ?>">
        <?php _e('Ver Artigos', 'saraivavision'); ?>
      </a>
    </div>
  </div>
</section>

<section class="content container">
  <?php
  // Optionally show latest posts preview
  $q = new WP_Query(['posts_per_page' => 3]);
  if ($q->have_posts()): ?>
    <h2><?php _e('Últimos Artigos', 'saraivavision'); ?></h2>
    <ul>
      <?php while ($q->have_posts()): $q->the_post(); ?>
        <li>
          <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
          <span class="entry-meta">&middot; <?php echo get_the_date(); ?></span>
        </li>
      <?php endwhile; wp_reset_postdata(); ?>
    </ul>
  <?php endif; ?>
</section>

<?php get_footer();

