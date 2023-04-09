import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Photo } from './photo';

/**
 * Photo と1対1で紐づくクラス
 */
@Entity()
export class PhotoMetadata {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('int')
  height?: number;

  @Column('int')
  width?: number;

  @Column()
  orientation?: string;

  @Column()
  compressed?: boolean;

  @Column()
  comment?: string;

  // ここでは、@OneToOne という新しいデコレータを使用しています。
  // type => Photo は、リレーションを作成したいエンティティのクラスを返す関数です。
  // 言語の仕様上、クラスを直接使用するのではなく、クラスを返す関数を使用せざるを得ません。
  // () => Photoと書くこともできますが、コードの可読性を高めるために、慣習としてtype => Photoとしています。なお、type変数自体には何も入れません。
  //
  // また、@JoinColumnデコレーターを追加し、こちら側がリレーションシップを所有することを示します。
  // リレーションには単方向と双方向がある。リレーションは片方だけが所有することができます。リレーションのオーナー側では、@JoinColumnデコレーターの使用が必須となります。
  @OneToOne((type) => Photo)
  @JoinColumn()
  photo?: Photo;
}
