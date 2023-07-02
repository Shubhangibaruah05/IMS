import { Anchor, Container, Group } from '@mantine/core';

import { links } from '../../defaults';
import { InvenTreeStyle } from '../../globalStyle';
import { InvenTreeLogo } from '../items/InvenTreeLogo';

export function Footer() {
  const { classes } = InvenTreeStyle();
  const items = links.map((link) => (
    <Anchor<'a'>
      color="dimmed"
      key={link.key}
      href={link.link}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.layoutFooter}>
      <Container className={classes.layoutFooterInner} size={'xl'}>
        <InvenTreeLogo />
        <Group className={classes.layoutFooterLinks}>{items}</Group>
      </Container>
    </div>
  );
}
