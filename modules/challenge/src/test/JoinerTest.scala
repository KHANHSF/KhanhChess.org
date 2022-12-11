package lila.challenge

import chess.variant.{ FromPosition, Standard }
import org.specs2.mutable._

import lila.game.Game
import chess.Clock

final class JoinerTest extends Specification {

  val timeControl =
    Challenge.TimeControl.Clock(Clock.Config(Clock.LimitSeconds(300), Clock.IncrementSeconds(0)))

  "create empty game" >> {
    "started at turn 0" >> {
      val challenge = Challenge.make(
        variant = Standard,
        initialFen = None,
        timeControl = timeControl,
        mode = chess.Mode.Casual,
        color = "white",
        challenger = Challenge.Challenger.Anonymous("secret"),
        destUser = None,
        rematchOf = None
      )
      ChallengeJoiner.createGame(challenge, None, None) must beLike { case g: Game =>
        g.chess.startedAtTurn === 0
      }
    }
    "started at turn from position" >> {
      val position = "r1bqkbnr/ppp2ppp/2npp3/8/8/2NPP3/PPP2PPP/R1BQKBNR w KQkq - 2 4"
      val challenge = Challenge.make(
        variant = FromPosition,
        initialFen = Some(chess.format.Fen.Epd(position)),
        timeControl = timeControl,
        mode = chess.Mode.Casual,
        color = "white",
        challenger = Challenge.Challenger.Anonymous("secret"),
        destUser = None,
        rematchOf = None
      )
      ChallengeJoiner.createGame(challenge, None, None) must beLike { case g: Game =>
        g.chess.startedAtTurn === 6
      }
    }
  }
}
