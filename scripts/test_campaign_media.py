"""Unit tests for campaign previews; no browser or third-party requests."""
import unittest
from build_portfolio import campaign_media, campaign_metrics


class CampaignMediaTests(unittest.TestCase):
    def test_no_gallery_without_sources(self):
        self.assertEqual(campaign_media({}), '')
        self.assertEqual(campaign_metrics({}), '')

    def test_preview_links_directly_to_original(self):
        item = dict(title='Campaign film', kind='Video', url='https://www.instagram.com/p/example/',
                    image='test-frame.jpg', alt='Campaign preview', description='A campaign film.',
                    source_name='Yello on Instagram', published='12 December 2025')
        html = campaign_media({'media': [item]})
        self.assertIn('href="'+item['url']+'"', html)
        self.assertIn('src="../assets/images/projects/test-frame.jpg"', html)
        self.assertIn('alt="Campaign preview"', html)
        self.assertIn('rel="noopener noreferrer"', html)
        self.assertIn('12 December 2025', html)
        self.assertNotIn('<iframe', html)
        self.assertNotIn('<script', html)

    def test_caption_content_is_escaped(self):
        item = dict(title='<Title>', kind='Image', url='https://www.instagram.com/p/example/',
                    image='test-frame.jpg', alt='A & B', description='One < two', source_name='Yello')
        html = campaign_media({'media': [item]})
        self.assertIn('&lt;Title&gt;', html)
        self.assertIn('alt="A &amp; B"', html)
        self.assertNotIn('<Title>', html)

    def test_missing_image_is_an_honest_text_card(self):
        item = dict(title='Campaign post', kind='Video', url='https://www.instagram.com/p/example/',
                    description='A source-linked post.', source_name='Instagram')
        html = campaign_media({'media': [item]})
        self.assertIn('Open original post', html)
        self.assertNotIn('<img', html)
        self.assertNotIn('campaign-media-frame', html)

    def test_metrics_preserve_scope_and_source(self):
        item = dict(label='Reported views', value='Example', scope='Example scope',
                    source_url='https://example.org/source', source_label='Source record')
        html = campaign_metrics({'metrics': [item]})
        for text in ['Reported views', 'Example scope', 'Source record', 'https://example.org/source']:
            self.assertIn(text, html)

    def test_internal_record_does_not_expose_private_link(self):
        item = dict(label='Reported views', value='Example', scope='Historical snapshot',
                    source_label='Internal campaign record, March 2026')
        html = campaign_metrics({'metrics': [item]})
        self.assertIn('Internal campaign record, March 2026', html)
        self.assertNotIn('href=', html)


if __name__ == '__main__':
    unittest.main()
