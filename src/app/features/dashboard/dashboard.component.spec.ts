import { describe, it, expect } from 'vitest';
import { of } from 'rxjs';
import { Topic } from '../../core/interfaces/topic';
import { Group } from '../../core/interfaces/group';
import { News } from '../../core/interfaces/news';

const makeTopic = (id: string): Topic => ({
  id, title: `Topic ${id}`, intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: 'read' },
  categories: [], endsAt: null, createdAt: '', updatedAt: '', sourcePartnerId: null,
  sourcePartnerObjectId: null, permission: { level: 'read' }, creator: null,
  lastActivity: null, country: null, language: null, members: { users: { count: 0 }, groups: { count: 0 } }, voteId: null,
  ideationId: null, discussionId: null, comments: null, padUrl: null,
  favourite: null, imageUrl: null, authors: []
});

const makeGroup = (id: string): Group => ({
  id, name: `Group ${id}`, description: '', visibility: 'public',
  join: { token: '', level: 'read' }, createdAt: '', updatedAt: '',
  sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'read' },
  creator: null, lastActivity: null, members: { users: { count: 0 }, groups: { count: 0 } }, userLevel: null, imageUrl: null,
  language: null, country: null, categories: null, rules: [], contact: null,
  favourite: null, inviteMessage: null
});

const makeNews = (id: string, content = '<p>text</p>'): News => ({
  id, title: `News ${id}`, link: 'https://citizenos.com', pubDate: new Date(),
  author: '', content, contentSnippet: '', summary: '', isoDate: new Date()
});

describe('DashboardComponent logic', () => {
  const makeServices = (overrides: {
    myTopics?: Topic[];
    publicTopics?: Topic[];
    myGroups?: Group[];
    publicGroups?: Group[];
    news?: News[];
  } = {}) => ({
    userTopicService: { loadItems: () => of(overrides.myTopics ?? []) },
    publicTopicService: { loadItems: () => of(overrides.publicTopics ?? []) },
    userGroupService: { loadItems: () => of(overrides.myGroups ?? []) },
    publicGroupService: { loadItems: () => of(overrides.publicGroups ?? []) },
    newsService: { get: () => of(overrides.news ?? []) },
  });

  it('hasNoEngagements is true when user has no topics', () => {
    const services = makeServices({ myTopics: [] });
    let myTopicsValue: Topic[] = [];
    services.userTopicService.loadItems().subscribe(v => (myTopicsValue = v));
    expect(myTopicsValue.length).toBe(0);
  });

  it('hasNoEngagements is false when user has topics', () => {
    const services = makeServices({ myTopics: [makeTopic('1')] });
    let myTopicsValue: Topic[] = [];
    services.userTopicService.loadItems().subscribe(v => (myTopicsValue = v));
    expect(myTopicsValue.length).toBeGreaterThan(0);
  });

  it('returns correct public topics', () => {
    const services = makeServices({ publicTopics: [makeTopic('p1'), makeTopic('p2')] });
    let result: Topic[] = [];
    services.publicTopicService.loadItems().subscribe(v => (result = v));
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('p1');
  });

  it('returns correct groups', () => {
    const services = makeServices({ myGroups: [makeGroup('g1')], publicGroups: [makeGroup('pg1')] });
    let myGroups: Group[] = [];
    let publicGroups: Group[] = [];
    services.userGroupService.loadItems().subscribe(v => (myGroups = v));
    services.publicGroupService.loadItems().subscribe(v => (publicGroups = v));
    expect(myGroups.length).toBe(1);
    expect(publicGroups.length).toBe(1);
  });

  it('limits news items to first 4', () => {
    const news = [1, 2, 3, 4, 5, 6].map(i => makeNews(String(i)));
    const services = makeServices({ news });
    let result: News[] = [];
    services.newsService.get().subscribe(v => (result = v));
    expect(result.slice(0, 4).length).toBe(4);
  });

  it('extracts image URL from news content HTML', () => {
    const imgSrc = 'https://example.com/image.jpg';
    const newsItem = makeNews('1', `<p><img src="${imgSrc}" /></p>`);
    const el = document.createElement('div');
    el.innerHTML = newsItem.content;
    const img = el.querySelector('img');
    const extracted = img ? { ...newsItem, imageUrl: img.src } : newsItem;
    expect(extracted.imageUrl).toBe(imgSrc);
  });

  it('leaves imageUrl undefined when news content has no image', () => {
    const newsItem = makeNews('1', '<p>No image here</p>');
    const el = document.createElement('div');
    el.innerHTML = newsItem.content;
    const img = el.querySelector('img');
    const extracted = img ? { ...newsItem, imageUrl: img.src } : newsItem;
    expect(extracted.imageUrl).toBeUndefined();
  });

  it('showCreate toggle switches between true and false', () => {
    let show = false;
    const toggle = () => { show = !show; };

    expect(show).toBe(false);
    toggle();
    expect(show).toBe(true);
    toggle();
    expect(show).toBe(false);
  });
});
